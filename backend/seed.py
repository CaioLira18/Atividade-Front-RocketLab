import pandas as pd
import os
from sqlalchemy.orm import Session
from app.database import SessionLocal, Base, engine
from app.models import (
    Consumidor, Vendedor, Produto,
    Pedido, ItemPedido, AvaliacaoPedido, CategoriaImagem
)

def load_csv(file_name):
    path = os.path.join("csv", file_name)
    if not os.path.exists(path):
        print(f"  ⚠ Arquivo {file_name} não encontrado.")
        return None
    df = pd.read_csv(path)
    df.columns = df.columns.str.strip().str.lower()
    print(f"  → Colunas: {list(df.columns)}")
    return df

def nullable(val, cast=None):
    if val is None:
        return None
    try:
        if pd.isna(val):
            return None
    except (TypeError, ValueError):
        pass
    return cast(val) if cast else val

def to_dt(val):
    v = nullable(val)
    if v is None:
        return None
    result = pd.to_datetime(v)
    return None if pd.isna(result) else result

def seed():
    print("\n🗑  Recriando tabelas do zero...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("  ✅ Tabelas recriadas.\n")

    db: Session = SessionLocal()
    try:
        # 1. Categorias e Imagens
        print("📂 Populando CategoriaImagem...")
        df = load_csv("dim_categoria_imagens.csv")
        if df is not None:
            for _, row in df.iterrows():
                db.add(CategoriaImagem(
                    categoria=row['categoria'],
                    link=row['link']
                ))
            db.commit()
            print(f"  ✅ {len(df)} registros inseridos.")

        # 2. Vendedores
        print("\n📂 Populando Vendedor...")
        df = load_csv("dim_vendedores.csv")
        if df is not None:
            for _, row in df.iterrows():
                db.add(Vendedor(
                    id_vendedor=row['id_vendedor'],
                    nome_vendedor=row['nome_vendedor'],
                    prefixo_cep=row['prefixo_cep'],
                    cidade=row['cidade'],
                    estado=row['estado']
                ))
            db.commit()
            print(f"  ✅ {len(df)} registros inseridos.")

        # 3. Consumidores
        print("\n📂 Populando Consumidor...")
        df = load_csv("dim_consumidores.csv")
        if df is not None:
            df = df.drop_duplicates(subset=['id_consumidor'])
            for _, row in df.iterrows():
                db.add(Consumidor(
                    id_consumidor=row['id_consumidor'],
                    prefixo_cep=row['prefixo_cep'],
                    nome_consumidor=row['nome_consumidor'],
                    cidade=row['cidade'],
                    estado=row['estado']
                ))
            db.commit()
            print(f"  ✅ {len(df)} registros inseridos.")

        # 4. Produtos
        print("\n📂 Populando Produto...")
        df = load_csv("dim_produtos.csv")
        if df is not None:
            # Diagnóstico: mostra linhas com categoria_produto nula
            nulos = df[df['categoria_produto'].isna()]
            if not nulos.empty:
                print(f"  ⚠ {len(nulos)} linhas com categoria_produto nula — serão ignoradas:")
                print(nulos[['id_produto', 'nome_produto', 'categoria_produto']].to_string())
                df = df.dropna(subset=['categoria_produto'])

            for _, row in df.iterrows():
                db.add(Produto(
                    id_produto=row['id_produto'],
                    nome_produto=row['nome_produto'],
                    categoria_produto=str(row['categoria_produto']),
                    peso_produto_gramas=nullable(row['peso_produto_gramas'], float),
                    comprimento_centimetros=nullable(row['comprimento_centimetros'], float),
                    altura_centimetros=nullable(row['altura_centimetros'], float),
                    largura_centimetros=nullable(row['largura_centimetros'], float)
                ))
            db.commit()
            print(f"  ✅ {len(df)} registros inseridos.")

        # 5. Pedidos
        print("\n📂 Populando Pedido...")
        df = load_csv("fat_pedidos.csv")
        if df is not None:
            for _, row in df.iterrows():
                db.add(Pedido(
                    id_pedido=row['id_pedido'],
                    id_consumidor=row['id_consumidor'],
                    status=row['status'],
                    pedido_compra_timestamp=to_dt(row['pedido_compra_timestamp']),
                    pedido_entregue_timestamp=to_dt(row.get('pedido_entregue_timestamp')),
                    data_estimada_entrega=to_dt(row.get('data_estimada_entrega')),
                    tempo_entrega_dias=nullable(row.get('tempo_entrega_dias'), float),
                    tempo_entrega_estimado_dias=nullable(row.get('tempo_entrega_estimado_dias'), float),
                    diferenca_entrega_dias=nullable(row.get('diferenca_entrega_dias'), float),
                    entrega_no_prazo=nullable(row.get('entrega_no_prazo'))
                ))
            db.commit()
            print(f"  ✅ {len(df)} registros inseridos.")

        # 6. Itens do Pedido
        print("\n📂 Populando ItemPedido...")
        df = load_csv("fat_itens_pedidos.csv")
        if df is not None:
            col_preco = next((c for c in df.columns if 'preco_brl' in c.lower()), 'preco_brl')
            for _, row in df.iterrows():
                db.add(ItemPedido(
                    id_pedido=row['id_pedido'],
                    id_item=int(row['id_item']),
                    id_produto=row['id_produto'],
                    id_vendedor=row['id_vendedor'],
                    preco_BRL=float(row[col_preco]),
                    preco_frete=float(row['preco_frete'])
                ))
            db.commit()
            print(f"  ✅ {len(df)} registros inseridos.")

        # 7. Avaliações
        print("\n📂 Populando AvaliacaoPedido...")
        df = load_csv("fat_avaliacoes_pedidos.csv")
        if df is not None:
            df = df.drop_duplicates(subset=['id_avaliacao'])
            for _, row in df.iterrows():
                db.add(AvaliacaoPedido(
                    id_avaliacao=row['id_avaliacao'],
                    id_pedido=row['id_pedido'],
                    avaliacao=int(row['avaliacao']),
                    titulo_comentario=nullable(row.get('titulo_comentario')),
                    comentario=nullable(row.get('comentario')),
                    data_comentario=to_dt(row.get('data_comentario')),
                    data_resposta=to_dt(row.get('data_resposta'))
                ))
            db.commit()
            print(f"  ✅ {len(df)} registros inseridos.")

        print("\n🎉 Banco de dados populado com sucesso!")

    except Exception as e:
        print(f"\n❌ Erro crítico: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()