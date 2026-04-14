from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Consumidor
from app.schemas.consumidor import ConsumidorSchema

router = APIRouter(tags=["Consumidores"])

@router.get("/consumidores", response_model=List[ConsumidorSchema])
def get_consumidores(db: Session = Depends(get_db), limit: int = Query(20), offset: int = Query(0)):
    return db.query(Consumidor).limit(limit).offset(offset).all()

@router.post("/consumidores")
def create_consumidor(dados: ConsumidorSchema, db: Session = Depends(get_db)):
    novo = Consumidor(**dados.model_dump())
    db.add(novo)
    db.commit()
    return novo

@router.put("/consumidores/{id}")
def update_consumidor(id: str, dados: ConsumidorSchema, db: Session = Depends(get_db)):
    obj = db.query(Consumidor).filter(Consumidor.id_consumidor == id).first()
    if not obj: raise HTTPException(404, "Consumidor não encontrado")
    for k, v in dados.model_dump().items(): setattr(obj, k, v)
    db.commit()
    return obj

@router.delete("/consumidores/{id}")
def delete_consumidor(id: str, db: Session = Depends(get_db)):
    obj = db.query(Consumidor).filter(Consumidor.id_consumidor == id).first()
    if not obj: raise HTTPException(404, "Consumidor não encontrado")
    db.delete(obj)
    db.commit()
    return {"msg": "Deletado"}