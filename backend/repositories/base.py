from abc import ABC, abstractmethod
from typing import Dict, Optional,  Any
class ReviewRepositorie(ABC):
    @abstractmethod
    
    def check_analysis( self , place_id : str):
        # checa se existem analises no banco de dados
        pass
    
    
    def get_analysis( self, place_id : str) -> Optional[Dict]:
        # pega as analises e tras pro front se existirem
        pass
    
    def save_data( self, place_id : str, data : Dict[str,Any]):
        # salva dados de analises no banco de dados
        pass