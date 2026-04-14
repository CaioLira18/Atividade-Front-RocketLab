from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import (
    produtos, consumidores, vendedores, 
    pedidos, avaliacoes_pedidos, itens_pedidos, categorias_imagens
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

# Inclusão dos Routers (mantendo caminhos originais)
app.include_router(produtos.router)
app.include_router(consumidores.router)
app.include_router(vendedores.router)
app.include_router(pedidos.router)
app.include_router(itens_pedidos.router)
app.include_router(avaliacoes_pedidos.router)
app.include_router(categorias_imagens.router)

@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "API rodando com sucesso!"}