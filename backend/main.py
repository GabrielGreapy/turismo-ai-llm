from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
import os
import json
from dotenv import load_dotenv
from adapters.reviews.apify import ApifyReviewsAdapter
from adapters.reviews.base import ReviewProviderAdapter

if os.path.exists(".env.local"):
    load_dotenv(dotenv_path=".env.local")
else:
    load_dotenv(dotenv_path=".env")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Inicialização do cliente da OpenAI
openai_client = OpenAI(api_key=OPENAI_API_KEY)

def dividir_em_lotes(lista, tamanho_lote):
    """Divide uma lista grande em pedaços menores (lotes)."""
    for i in range(0, len(lista), tamanho_lote):
        yield lista[i:i + tamanho_lote]

def get_reviews_adapter() -> ReviewProviderAdapter:
    token =  os.getenv("APIFY_TOKEN")
    if not token:
        raise HTTPException(status_code=500, detail="Token do Apify não configurado.")
    return ApifyReviewsAdapter(token_apify=token)


@app.get("/api/spots/{place_id}/reviews")
async def get_spot_reviews(
    place_id: str, 
    limit: int = 50,
    review_adapter : ReviewProviderAdapter = Depends(get_reviews_adapter)
    ):     

    

    try:
        # 1. Extração dos comentários via Apify
        reviews_model = review_adapter.fetch_reviews(place_id=place_id, limit=limit)
        if not reviews_model:
            return {"total": 0, "reviews": [], "analise_ia": None}
        
        textos_para_analise = [r.text for r in reviews_model]
        reviews = [r.model_dump() for r in reviews_model]
        
        

        # 2. Processamento em Lotes (Batching)
        TAMANHO_DO_LOTE = 50 # Envia 50 comentários por vez para a IA
        alertas_gerais = []
        resumos_gerais = []
        niveis_encontrados = []

        for lote in dividir_em_lotes(textos_para_analise, TAMANHO_DO_LOTE):
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                temperature=0.1,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "Você é um sistema de IA voltado para a segurança em destinos turísticos. "
                            "Analise as avaliações a seguir e identifique qualquer relato de assédio, "
                            "crimes, golpes ou problemas graves de infraestrutura. "
                            "Ignore comentários em branco ou que não contenham informações relevantes para a análise. "
                            "Responda EXCLUSIVAMENTE em formato JSON válido, seguindo estritamente a estrutura abaixo: "
                            "{"
                            "  \"nivel_risco\": \"Baixo, Médio ou Alto\","
                            "  \"resumo\": \"Um breve resumo da percepção de segurança do local\","
                            "  \"alertas\": ["
                            "    {"
                            "      \"descricao\": \"Resumo do problema relatado\","
                            "      \"citacao\": \"Trecho exato do comentário que comprova o problema\","
                            "      \"tag\": \"Atribua uma única tag categórica (ex: 'assédio', 'crime', 'golpe', 'infraestrutura')\""
                            "    }"
                            "  ]"
                            "}"
                            "Se não houver nenhum problema relatado, retorne a lista 'alertas' vazia []."
                        )
                    },
                    {
                        "role": "user",
                        "content": json.dumps(lote, ensure_ascii=False)
                    }
                ],
                response_format={"type": "json_object"}
            )

            # Extrai o resultado deste lote
            resultado_lote = json.loads(response.choices[0].message.content)
            
            # Acumula os alertas (se a chave existir e for uma lista)
            if "alertas" in resultado_lote and isinstance(resultado_lote["alertas"], list):
                alertas_gerais.extend(resultado_lote["alertas"])
            
            # Guarda resumos e níveis para decidir o cenário geral depois
            resumos_gerais.append(resultado_lote.get("resumo", ""))
            niveis_encontrados.append(resultado_lote.get("nivel_risco", "Baixo"))

        # 3. Agregação Final dos Dados
        nivel_final = "Baixo"
        if "Alto" in niveis_encontrados:
            nivel_final = "Alto"
        elif "Médio" in niveis_encontrados:
            nivel_final = "Médio"

        # Une os pequenos resumos de cada lote
        resumo_final = " | ".join([r for r in resumos_gerais if r])

        resultado_ia_agregado = {
            "nivel_risco": nivel_final,
            "resumo": resumo_final,
            "alertas": alertas_gerais
        }

        # 4. Retorna tudo junto para o Frontend
        return {
            "total": len(reviews),
            "reviews": reviews,
            "analise_ia": resultado_ia_agregado
        }

    except Exception as e:
        print(f"Erro no processamento: {e}")
        raise HTTPException(status_code=500, detail="Erro ao processar comentários e IA.")