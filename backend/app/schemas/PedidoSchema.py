from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class PedidoSchema(BaseModel):
    id_pedido: str
    id_consumidor: str
    status: str
    pedido_compra_timestamp: Optional[datetime] = None
    pedido_entregue_timestamp: Optional[datetime] = None
    data_estimada_entrega: Optional[date] = None
    tempo_entrega_dias: Optional[float] = None
    tempo_entrega_estimado_dias: Optional[float] = None
    diferenca_entrega_dias: Optional[float] = None
    entrega_no_prazo: Optional[str] = None

    class Config:
        from_attributes = True
