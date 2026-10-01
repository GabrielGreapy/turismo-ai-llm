from abc import ABC, abstractmethod
from typing import Dict, Optional,  Any
class ReviewRepositorie(ABC):
    
    
    @abstractmethod
    async def get_analysis( self, place_id : str) -> Optional[Dict]:
        # pega as analises e tras pro front se existirem
        pass

    @abstractmethod
    async def save_data( self, place_id : str, data : Dict[str,Any]):
        # salva dados de analises no banco de dados
        pass