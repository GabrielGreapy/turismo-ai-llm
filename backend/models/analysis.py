from pydantic import BaseModel
from typing import List

class AlertaItemModel(BaseModel):
    descricao: str
    citacao: str
    nivel_risco_alerta: str
    tag : str
    
class AnalyzeAIModel(BaseModel):
    nivel_risco : str
    resumo : str
    alertas : List[AlertaItemModel]
    
        
        
        

    