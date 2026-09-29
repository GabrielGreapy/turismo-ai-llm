from backend.adapters.reviews.base import ReviewProviderAdapter
from ...models.review import ReviewSchema
from typing import List


class MockReviewsAdapter(ReviewProviderAdapter):
    
    def fetch_reviews(self, place_id, limit) -> List[ReviewSchema]:
        return[
            ReviewSchema(
                author="Maria Silva",
                rating=5.0,
                text="Lugar excelente e muito seguro!",
                date="2026-01-10"
            ),
            ReviewSchema(
                author="João Santos",
                rating=1.0,
                text="Fui assaltado perto da entrada principal, fiquem atentos.",
                date="2026-02-01"
            )
        ]
        