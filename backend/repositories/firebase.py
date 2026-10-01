from typing import Dict, Optional, Any
from google.cloud.firestore_v1.base_query import FieldFilter
from repositories.base import ReviewRepositorie
from config.firebase import init_firebase


class FirebaseReviewRepository(ReviewRepositorie):
    def __init__(self):
        self.db = init_firebase()
        self.collection_name = "analysis_cache"

    async def get_analysis(self, place_id : str) -> Optional[Dict[ str, Any]]:
        doc_ref = self.db.collection(self.collection_name).document(place_id)
        await doc = doc_ref.get()
        
        if doc.exists:
            print(f"[FIREBASE CACHE HIT] Dados encontrados para: {place_id}")
            return doc.to_dict()
    async def save_data(self, place_id : str, data: Dict[str, Any]) -> None:
        
        print(f"💾 [FIREBASE SAVE] Guardando dados em cache para: {place_id}")
        doc_ref = self.db.collection(self.collection_name).document(place_id)
        
        await doc_ref.set(data)
        
        