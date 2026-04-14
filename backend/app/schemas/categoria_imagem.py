from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class CategoriaImagemSchema(BaseModel):
    categoria: str
    link: str

    class Config:
        from_attributes = True