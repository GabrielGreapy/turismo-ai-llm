from pydantic import BaseModel
from typing import Optional
class ReviewSchema(BaseModel):
    author : str
    rating : float
    text : str
    date : Optional[str] = None
    