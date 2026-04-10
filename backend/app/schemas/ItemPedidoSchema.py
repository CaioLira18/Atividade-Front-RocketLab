from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class ItemPedidoSchema(BaseModel):
    id_pedido: str
    id_item: int
    id_produto: str
    id_vendedor: str
    preco_BRL: float
    preco_frete: float

    class Config:
        from_attributes = True
