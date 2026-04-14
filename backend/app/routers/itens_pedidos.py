from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import ItemPedido
from app.schemas.item_pedido import ItemPedidoSchema

router = APIRouter(tags=["Itens Pedido"])

@router.get("/itens", response_model=List[ItemPedidoSchema])
def get_itens(db: Session = Depends(get_db), limit: int = Query(20), offset: int = Query(0)):
    return db.query(ItemPedido).limit(limit).offset(offset).all()

@router.post("/itens")
def create_item(dados: ItemPedidoSchema, db: Session = Depends(get_db)):
    novo = ItemPedido(**dados.model_dump())
    db.add(novo)
    db.commit()
    return novo

@router.delete("/itens/{id}")
def delete_item(id: int, db: Session = Depends(get_db)):
    obj = db.query(ItemPedido).filter(ItemPedido.id == id).first()
    if not obj: raise HTTPException(404, "Item não encontrado")
    db.delete(obj)
    db.commit()
    return {"msg": "Deletado"}