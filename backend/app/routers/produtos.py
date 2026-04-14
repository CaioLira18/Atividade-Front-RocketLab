import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models import Produto, CategoriaImagem, ItemPedido, AvaliacaoPedido
from app.schemas.produto import ProdutoSchema
from app.schemas.produto_update import ProdutoUpdate
from app.schemas.avaliacao_pedido import AvaliacaoPedidoSchema

router = APIRouter(tags=["Produtos"])

@router.get("/produtos", response_model=List[ProdutoSchema])
def get_produtos(
    db: Session = Depends(get_db),
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0, ge=0),
    busca: str = Query(default=""),
):
    query = (
        db.query(Produto, CategoriaImagem.link, func.avg(ItemPedido.preco_BRL).label("preco_medio"))
        .outerjoin(CategoriaImagem, Produto.categoria_produto == CategoriaImagem.categoria)
        .outerjoin(ItemPedido, Produto.id_produto == ItemPedido.id_produto)
        .group_by(Produto.id_produto)
    )
    if busca:
        query = query.filter(Produto.nome_produto.ilike(f"%{busca}%"))

    resultados = query.limit(limit).offset(offset).all()

    produtos = []
    for produto, link_categoria, preco_medio in resultados:
        dados = ProdutoSchema.model_validate(produto)
        if not dados.imagem_url:
            dados.imagem_url = link_categoria
        dados.preco_medio = round(preco_medio, 2) if preco_medio else None
        produtos.append(dados)
    return produtos

@router.get("/produtos/{id}/preco")
def get_preco_produto(id: str, db: Session = Depends(get_db)):
    resultado = (
        db.query(
            func.avg(ItemPedido.preco_BRL).label("preco_medio"),
            func.min(ItemPedido.preco_BRL).label("preco_min"),
            func.max(ItemPedido.preco_BRL).label("preco_max"),
            func.count(ItemPedido.id_pedido).label("total_vendas"),
        )
        .filter(ItemPedido.id_produto == id)
        .first()
    )
    return {
        "preco_medio": round(resultado.preco_medio, 2) if resultado.preco_medio else None,
        "preco_min": resultado.preco_min,
        "preco_max": resultado.preco_max,
        "total_vendas": resultado.total_vendas,
    }

@router.get("/produtos/{id}/avaliacoes", response_model=List[AvaliacaoPedidoSchema])
def get_avaliacoes_produto(id: str, db: Session = Depends(get_db)):
    pedido_ids = (
        db.query(ItemPedido.id_pedido)
        .filter(ItemPedido.id_produto == id)
        .subquery()
    )
    return (
        db.query(AvaliacaoPedido)
        .filter(AvaliacaoPedido.id_pedido.in_(pedido_ids))
        .all()
    )

@router.get("/produtos/{id}", response_model=ProdutoSchema)
def get_produto(id: str, db: Session = Depends(get_db)):
    resultado = (
        db.query(Produto, CategoriaImagem.link)
        .outerjoin(CategoriaImagem, Produto.categoria_produto == CategoriaImagem.categoria)
        .filter(Produto.id_produto == id)
        .first()
    )
    if not resultado:
        raise HTTPException(404, "Produto não encontrado")
    produto, link_categoria = resultado
    dados = ProdutoSchema.model_validate(produto)
    if not dados.imagem_url:
        dados.imagem_url = link_categoria
    return dados

@router.post("/produtos", response_model=ProdutoSchema)
def create_produto(produto: ProdutoUpdate, db: Session = Depends(get_db)):
    novo = Produto(
        id_produto=uuid.uuid4().hex,
        **produto.model_dump(exclude_unset=True)
    )
    db.add(novo)
    db.commit()
    db.refresh(novo)
    dados = ProdutoSchema.model_validate(novo)
    if not dados.imagem_url:
        cat_img = db.query(CategoriaImagem).filter(
            CategoriaImagem.categoria == novo.categoria_produto
        ).first()
        if cat_img:
            dados.imagem_url = cat_img.link
    return dados

@router.put("/produtos/{id}")
def update_produto(id: str, dados: ProdutoUpdate, db: Session = Depends(get_db)):
    obj = db.query(Produto).filter(Produto.id_produto == id).first()
    if not obj:
        raise HTTPException(404, "Produto não encontrado")
    for k, v in dados.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    return obj

@router.delete("/produtos/{id}")
def delete_produto(id: str, db: Session = Depends(get_db)):
    obj = db.query(Produto).filter(Produto.id_produto == id).first()
    if not obj:
        raise HTTPException(404, "Produto não encontrado")
    db.delete(obj)
    db.commit()
    return {"msg": "Deletado"}