import uuid
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.schemas.ProdutoSchema import ProdutoSchema
from app.schemas.ProdutoUpdate import ProdutoUpdate
from app.schemas.ConsumidorSchema import ConsumidorSchema
from app.schemas.VendedorSchema import VendedorSchema
from app.schemas.PedidoSchema import PedidoSchema
from app.schemas.ItemPedidoSchema import ItemPedidoSchema
from app.schemas.AvaliacaoPedidoSchema import AvaliacaoPedidoSchema
from app.schemas.CategoriaImagemSchema import CategoriaImagemSchema
from app.database import SessionLocal

from app.models import (
    Produto, Consumidor, Vendedor,
    Pedido, ItemPedido, AvaliacaoPedido, CategoriaImagem
)

app = FastAPI(
    title="Sistema de Compras Online",
    description="API para gerenciamento de pedidos, produtos, consumidores e vendedores.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================
# 🏥 HEALTH CHECK
# =========================
@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "API rodando com sucesso!"}


# =========================
# 📦 PRODUTOS
# =========================
@app.get("/produtos", response_model=List[ProdutoSchema])
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
        # Usa imagem própria do produto; se não tiver, usa imagem da categoria
        if not dados.imagem_url:
            dados.imagem_url = link_categoria
        dados.preco_medio = round(preco_medio, 2) if preco_medio else None
        produtos.append(dados)
    return produtos


@app.get("/produtos/{id}/preco")
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


@app.get("/produtos/{id}/avaliacoes", response_model=List[AvaliacaoPedidoSchema])
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


@app.get("/produtos/{id}", response_model=ProdutoSchema)
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
    # Usa imagem própria do produto; se não tiver, usa imagem da categoria
    if not dados.imagem_url:
        dados.imagem_url = link_categoria
    return dados


@app.post("/produtos", response_model=ProdutoSchema)
def create_produto(produto: ProdutoUpdate, db: Session = Depends(get_db)):
    novo = Produto(
        id_produto=uuid.uuid4().hex,
        **produto.model_dump(exclude_unset=True)
    )
    db.add(novo)
    db.commit()
    db.refresh(novo)
    # Retorna com imagem da categoria se não tiver própria
    dados = ProdutoSchema.model_validate(novo)
    if not dados.imagem_url:
        cat_img = db.query(CategoriaImagem).filter(
            CategoriaImagem.categoria == novo.categoria_produto
        ).first()
        if cat_img:
            dados.imagem_url = cat_img.link
    return dados


@app.put("/produtos/{id}")
def update_produto(id: str, dados: ProdutoUpdate, db: Session = Depends(get_db)):
    obj = db.query(Produto).filter(Produto.id_produto == id).first()
    if not obj:
        raise HTTPException(404, "Produto não encontrado")
    for k, v in dados.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    return obj


@app.delete("/produtos/{id}")
def delete_produto(id: str, db: Session = Depends(get_db)):
    obj = db.query(Produto).filter(Produto.id_produto == id).first()
    if not obj:
        raise HTTPException(404, "Produto não encontrado")
    db.delete(obj)
    db.commit()
    return {"msg": "Deletado"}


# =========================
# 👤 CONSUMIDORES
# =========================
@app.get("/consumidores", response_model=List[ConsumidorSchema])
def get_consumidores(
    db: Session = Depends(get_db),
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0, ge=0),
):
    return db.query(Consumidor).limit(limit).offset(offset).all()

@app.post("/consumidores")
def create_consumidor(dados: ConsumidorSchema, db: Session = Depends(get_db)):
    novo = Consumidor(**dados.model_dump())
    db.add(novo)
    db.commit()
    return novo

@app.put("/consumidores/{id}")
def update_consumidor(id: str, dados: ConsumidorSchema, db: Session = Depends(get_db)):
    obj = db.query(Consumidor).filter(Consumidor.id_consumidor == id).first()
    if not obj:
        raise HTTPException(404, "Consumidor não encontrado")
    for k, v in dados.model_dump().items():
        setattr(obj, k, v)
    db.commit()
    return obj

@app.delete("/consumidores/{id}")
def delete_consumidor(id: str, db: Session = Depends(get_db)):
    obj = db.query(Consumidor).filter(Consumidor.id_consumidor == id).first()
    if not obj:
        raise HTTPException(404, "Consumidor não encontrado")
    db.delete(obj)
    db.commit()
    return {"msg": "Deletado"}


# =========================
# 🧑‍💼 VENDEDORES
# =========================
@app.get("/vendedores", response_model=List[VendedorSchema])
def get_vendedores(
    db: Session = Depends(get_db),
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0, ge=0),
):
    return db.query(Vendedor).limit(limit).offset(offset).all()

@app.post("/vendedores")
def create_vendedor(dados: VendedorSchema, db: Session = Depends(get_db)):
    novo = Vendedor(**dados.model_dump())
    db.add(novo)
    db.commit()
    return novo

@app.put("/vendedores/{id}")
def update_vendedor(id: str, dados: VendedorSchema, db: Session = Depends(get_db)):
    obj = db.query(Vendedor).filter(Vendedor.id_vendedor == id).first()
    if not obj:
        raise HTTPException(404, "Vendedor não encontrado")
    for k, v in dados.model_dump().items():
        setattr(obj, k, v)
    db.commit()
    return obj

@app.delete("/vendedores/{id}")
def delete_vendedor(id: str, db: Session = Depends(get_db)):
    obj = db.query(Vendedor).filter(Vendedor.id_vendedor == id).first()
    if not obj:
        raise HTTPException(404, "Vendedor não encontrado")
    db.delete(obj)
    db.commit()
    return {"msg": "Deletado"}


# =========================
# 📦 PEDIDOS
# =========================
@app.get("/pedidos", response_model=List[PedidoSchema])
def get_pedidos(
    db: Session = Depends(get_db),
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0, ge=0),
):
    return db.query(Pedido).limit(limit).offset(offset).all()

@app.post("/pedidos")
def create_pedido(dados: PedidoSchema, db: Session = Depends(get_db)):
    novo = Pedido(**dados.model_dump())
    db.add(novo)
    db.commit()
    return novo

@app.put("/pedidos/{id}")
def update_pedido(id: str, dados: PedidoSchema, db: Session = Depends(get_db)):
    obj = db.query(Pedido).filter(Pedido.id_pedido == id).first()
    if not obj:
        raise HTTPException(404, "Pedido não encontrado")
    for k, v in dados.model_dump().items():
        setattr(obj, k, v)
    db.commit()
    return obj

@app.delete("/pedidos/{id}")
def delete_pedido(id: str, db: Session = Depends(get_db)):
    obj = db.query(Pedido).filter(Pedido.id_pedido == id).first()
    if not obj:
        raise HTTPException(404, "Pedido não encontrado")
    db.delete(obj)
    db.commit()
    return {"msg": "Deletado"}


# =========================
# 🧾 ITENS PEDIDO
# =========================
@app.get("/itens", response_model=List[ItemPedidoSchema])
def get_itens(
    db: Session = Depends(get_db),
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0, ge=0),
):
    return db.query(ItemPedido).limit(limit).offset(offset).all()

@app.post("/itens")
def create_item(dados: ItemPedidoSchema, db: Session = Depends(get_db)):
    novo = ItemPedido(**dados.model_dump())
    db.add(novo)
    db.commit()
    return novo

@app.delete("/itens/{id}")
def delete_item(id: int, db: Session = Depends(get_db)):
    obj = db.query(ItemPedido).filter(ItemPedido.id == id).first()
    if not obj:
        raise HTTPException(404, "Item não encontrado")
    db.delete(obj)
    db.commit()
    return {"msg": "Deletado"}


# =========================
# ⭐ AVALIAÇÕES
# =========================
@app.get("/avaliacoes", response_model=List[AvaliacaoPedidoSchema])
def get_avaliacoes(
    db: Session = Depends(get_db),
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0, ge=0),
):
    return db.query(AvaliacaoPedido).limit(limit).offset(offset).all()

@app.post("/avaliacoes")
def create_avaliacao(dados: AvaliacaoPedidoSchema, db: Session = Depends(get_db)):
    novo = AvaliacaoPedido(**dados.model_dump())
    db.add(novo)
    db.commit()
    return novo

@app.delete("/avaliacoes/{id}")
def delete_avaliacao(id: str, db: Session = Depends(get_db)):
    obj = db.query(AvaliacaoPedido).filter(AvaliacaoPedido.id_avaliacao == id).first()
    if not obj:
        raise HTTPException(404, "Avaliação não encontrada")
    db.delete(obj)
    db.commit()
    return {"msg": "Deletado"}


# =========================
# 🖼️ CATEGORIAS IMAGENS
# =========================
@app.get("/categorias-imagens", response_model=List[CategoriaImagemSchema])
def get_categorias(db: Session = Depends(get_db)):
    return db.query(CategoriaImagem).all()

@app.post("/categorias-imagens")
def create_categoria(dados: CategoriaImagemSchema, db: Session = Depends(get_db)):
    novo = CategoriaImagem(**dados.model_dump())
    db.add(novo)
    db.commit()
    return novo

@app.delete("/categorias-imagens/{categoria}")
def delete_categoria(categoria: str, db: Session = Depends(get_db)):
    obj = db.query(CategoriaImagem).filter(CategoriaImagem.categoria == categoria).first()
    if not obj:
        raise HTTPException(404, "Categoria não encontrada")
    db.delete(obj)
    db.commit()
    return {"msg": "Deletado"}