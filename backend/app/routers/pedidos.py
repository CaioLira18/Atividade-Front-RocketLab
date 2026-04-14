from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Pedido
from app.schemas.pedido import PedidoSchema

router = APIRouter(tags=["Pedidos"])

@router.get("/pedidos", response_model=List[PedidoSchema])
def get_pedidos(db: Session = Depends(get_db), limit: int = Query(20), offset: int = Query(0)):
    return db.query(Pedido).limit(limit).offset(offset).all()

@router.post("/pedidos")
def create_pedido(dados: PedidoSchema, db: Session = Depends(get_db)):
    novo = Pedido(**dados.model_dump())
    db.add(novo)
    db.commit()
    return novo

@router.put("/pedidos/{id}")
def update_pedido(id: str, dados: PedidoSchema, db: Session = Depends(get_db)):
    obj = db.query(Pedido).filter(Pedido.id_pedido == id).first()
    if not obj: raise HTTPException(404, "Pedido não encontrado")
    for k, v in dados.model_dump().items(): setattr(obj, k, v)
    db.commit()
    return obj

@router.delete("/pedidos/{id}")
def delete_pedido(id: str, db: Session = Depends(get_db)):
    obj = db.query(Pedido).filter(Pedido.id_pedido == id).first()
    if not obj: raise HTTPException(404, "Pedido não encontrado")
    db.delete(obj)
    db.commit()
    return {"msg": "Deletado"}