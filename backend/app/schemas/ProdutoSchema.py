from pydantic import BaseModel
from typing import Optional

class ProdutoSchema(BaseModel):
    id_produto: str
    nome_produto: str
    categoria_produto: str
    peso_produto_gramas: Optional[float] = None
    comprimento_centimetros: Optional[float] = None
    altura_centimetros: Optional[float] = None
    largura_centimetros: Optional[float] = None
    link_imagem: Optional[str] = None 

    class Config:
        from_attributes = True