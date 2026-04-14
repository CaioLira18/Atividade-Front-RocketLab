from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Vendedor
from app.schemas.vendedor import VendedorSchema

router = APIRouter(tags=["Vendedores"])

@router.get("/vendedores", response_model=List[VendedorSchema])
def get_vendedores(db: Session = Depends(get_db), limit: int = Query(20), offset: int = Query(0)):
    return db.query(Vendedor).limit(limit).offset(offset).all()

@router.post("/vendedores")
def create_vendedor(dados: VendedorSchema, db: Session = Depends(get_db)):
    novo = Vendedor(**dados.model_dump())
    db.add(novo)
    db.commit()
    return novo

@router.put("/vendedores/{id}")
def update_vendedor(id: str, dados: VendedorSchema, db: Session = Depends(get_db)):
    obj = db.query(Vendedor).filter(Vendedor.id_vendedor == id).first()
    if not obj: raise HTTPException(404, "Vendedor não encontrado")
    for k, v in dados.model_dump().items(): setattr(obj, k, v)
    db.commit()
    return obj

@router.delete("/vendedores/{id}")
def delete_vendedor(id: str, db: Session = Depends(get_db)):
    obj = db.query(Vendedor).filter(Vendedor.id_vendedor == id).first()
    if not obj: raise HTTPException(404, "Vendedor não encontrado")
    db.delete(obj)
    db.commit()
    return {"msg": "Deletado"}