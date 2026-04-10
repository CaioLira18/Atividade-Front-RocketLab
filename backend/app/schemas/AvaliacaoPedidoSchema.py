from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class AvaliacaoPedidoSchema(BaseModel):
    id_avaliacao: str
    id_pedido: str
    avaliacao: int
    titulo_comentario: Optional[str] = None
    comentario: Optional[str] = None
    data_comentario: Optional[datetime] = None
    data_resposta: Optional[datetime] = None

    class Config:
        from_attributes = True