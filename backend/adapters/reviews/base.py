from abc import ABC, abstractmethod

class ReviewProviderAdapter(ABC):
    
    @abstractmethod
    def fetch_reviews(self, place_id : str, limit : int):
        # Vai pegar garoto, as reviews vai vai
        pass