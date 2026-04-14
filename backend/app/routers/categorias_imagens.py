from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import CategoriaImagem
from app.schemas.categoria_imagem import CategoriaImagemSchema

router = APIRouter(tags=["Categorias Imagens"])

@router.get("/categorias-imagens", response_model=List[CategoriaImagemSchema])
def get_categorias(db: Session = Depends(get_db)):
    return db.query(CategoriaImagem).all()

@router.post("/categorias-imagens")
def create_categoria(dados: CategoriaImagemSchema, db: Session = Depends(get_db)):
    novo = CategoriaImagem(**dados.model_dump())
    db.add(novo)
    db.commit()
    return novo

@router.delete("/categorias-imagens/{categoria}")
def delete_categoria(categoria: str, db: Session = Depends(get_db)):
    obj = db.query(CategoriaImagem).filter(CategoriaImagem.categoria == categoria).first()
    if not obj: raise HTTPException(404, "Categoria não encontrada")
    db.delete(obj)
    db.commit()
    return {"msg": "Deletado"}