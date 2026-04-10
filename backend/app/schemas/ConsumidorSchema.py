from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class ConsumidorSchema(BaseModel):
    id_consumidor: str
    prefixo_cep: str
    nome_consumidor: str
    cidade: str
    estado: str

    class Config:
        from_attributes = True
