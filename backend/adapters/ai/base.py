from abc import ABC, abstractmethod
from models.analysis import AnalyzeAIModel
class AIAnalizerProviderAdapter(ABC):
    @abstractmethod
    def analizar_reviews(self, texts : list[str] ) -> AnalyzeAIModel:
        # Recebe textos pra analisar com o Open Ai #
        pass