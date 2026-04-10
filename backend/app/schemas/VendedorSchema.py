from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class VendedorSchema(BaseModel):
    id_vendedor: str
    nome_vendedor: str
    prefixo_cep: str
    cidade: str
    estado: str

    class Config:
        from_attributes = True