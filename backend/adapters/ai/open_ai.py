import json

from openai import OpenAI
from .base import AIAnalizerProviderAdapter
from models.analysis import AnalyzeAIModel

class OpenAIAdapter(AIAnalizerProviderAdapter):
    def __init__(self, open_ai_token : str):
        self.client = OpenAI(api_key=open_ai_token)
        
        
    
    def dividir_em_lotes(self, lista : list, tamanho_lote : int):
        for i in range(0, len(lista), tamanho_lote):
            yield lista[i:i + tamanho_lote]
    
    
    
    
    def analizar_reviews(self, texts : list[str]) -> dict:
        
    
        TAMANHO_DO_LOTE = 50 
        alertas_gerais = []
        resumos_gerais = []
        niveis_encontrados = []
        for lote in self.dividir_em_lotes(texts , TAMANHO_DO_LOTE):
            response = self.client.chat.completions.create(
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
            resultado_lote = json.loads(response.choices[0].message.content)
            if "alertas" in resultado_lote and isinstance(resultado_lote["alertas"], list):
                            alertas_gerais.extend(resultado_lote["alertas"])
                        
                        
            resumos_gerais.append(resultado_lote.get("resumo", ""))
            niveis_encontrados.append(resultado_lote.get("nivel_risco", "Baixo"))
            
        nivel_final = "Baixo"
        if "Alto" in niveis_encontrados:
            nivel_final = "Alto"
        elif "Médio" in niveis_encontrados:
            nivel_final = "Médio"
        
        resumo_final = " | ".join([r for r in resumos_gerais if r])
        
        resultado_ia_agregado = {
            "nivel_risco": nivel_final,
            "resumo": resumo_final,
            "alertas": alertas_gerais
        }
        return resultado_ia_agregado
        
             