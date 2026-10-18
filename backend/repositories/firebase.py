from typing import Dict, Optional, Any
from google.cloud import firestore  # Importação necessária para o Increment
from google.cloud.firestore_v1.base_query import FieldFilter
from repositories.base import ReviewRepositorie
from config.firebase import init_firebase


class FirebaseReviewRepository(ReviewRepositorie):
    def __init__(self):
        self.db = init_firebase()
        self.collection_name = "analysis_cache"
        self.global_collection_name = "global_status"
        self.global_doc_id = "metrics" 
    async def get_analysis(self, place_id: str) -> Optional[Dict[str, Any]]:
        doc_ref = self.db.collection(self.collection_name).document(place_id)
        doc = await doc_ref.get()
        
        if doc.exists:
            print(f"[FIREBASE CACHE HIT] Dados encontrados para: {place_id}")
            return doc.to_dict()
        return None

    from google.cloud import firestore



    async def save_data(self, place_id: str, data: Dict[str, Any]) -> None:
        print(f"💾 [FIREBASE SAVE] Guardando dados em cache para: {place_id}")
        
        # 1. Salva o Cache Principal (como já estava)
        doc_ref = self.db.collection(self.collection_name).document(place_id)
        await doc_ref.set(data)
        
        # 2. Extrai as informações de segurança da IA
        analise_ia = data.get("analise_ia", {}) if isinstance(data.get("analise_ia"), dict) else {}
        alertas = analise_ia.get("alertas", {})
        risco = alertas.get("nivel_risco", "Baixo")
        resumo = alertas.get("resumo", "Sem alertas identificados.")
        
        # 3. SISTEMA DE INFRAÇÕES (Tickets)
        incremento_medio = 0
        if risco in ["Médio", "Alto"]:
            incremento_medio = 1
            
            # Cria um documento na nova coleção de infrações
            ticket_ref = self.db.collection("infractions_tickets").document() # Gera ID automático
            
            ticket_data = {
                "place_id": place_id,
                "nivel_risco": risco,
                "resumo_ia": resumo,
                "status": "pendente",
                "data_criacao": firestore.SERVER_TIMESTAMP,
                "data_resolucao": None
            }
            await ticket_ref.set(ticket_data)
            print(f"🚨 [ALERTA] Nova infração registrada para {place_id}. Status: pendente.")
            
       
        reviews_list = data.get("reviews", [])
        total_reviews_novas = len(reviews_list) if isinstance(reviews_list, list) else 0
        
        doc_ref_global = self.db.collection(self.global_collection_name).document(self.global_doc_id)
        await doc_ref_global.set({
            "total_places": firestore.Increment(1),
            "total_comments": firestore.Increment(total_reviews_novas),
            "total_infractions_medium": firestore.Increment(incremento_medio)
        }, merge=True)