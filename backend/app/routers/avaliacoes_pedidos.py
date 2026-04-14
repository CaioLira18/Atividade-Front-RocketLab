from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import AvaliacaoPedido
from app.schemas.avaliacao_pedido import AvaliacaoPedidoSchema

router = APIRouter(tags=["Avaliações"])

@router.get("/avaliacoes", response_model=List[AvaliacaoPedidoSchema])
def get_avaliacoes(db: Session = Depends(get_db), limit: int = Query(20), offset: int = Query(0)):
    return db.query(AvaliacaoPedido).limit(limit).offset(offset).all()

@router.post("/avaliacoes")
def create_avaliacao(dados: AvaliacaoPedidoSchema, db: Session = Depends(get_db)):
    novo = AvaliacaoPedido(**dados.model_dump())
    db.add(novo)
    db.commit()
    return novo

@router.delete("/avaliacoes/{id}")
def delete_avaliacao(id: str, db: Session = Depends(get_db)):
    obj = db.query(AvaliacaoPedido).filter(AvaliacaoPedido.id_avaliacao == id).first()
    if not obj: raise HTTPException(404, "Avaliação não encontrada")
    db.delete(obj)
    db.commit()
    return {"msg": "Deletado"}