# 🛒 Sistema de Gerenciamento de E-commerce

![Backend](https://img.shields.io/badge/backend-FastAPI-009688)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61DAFB)
![Database](https://img.shields.io/badge/database-SQLite-003B57)
![License](https://img.shields.io/badge/license-MIT-green)

🚀 Projeto desenvolvido como parte do **Rocket Lab 2026 (Visagio)**
- Aplicação fullstack para gerenciamento de produtos de um e-commerce, permitindo visualizar, cadastrar, editar e analisar desempenho de produtos.
- Aluno: Caio Ferreira Lira de Oliveira

---

## 📌 Funcionalidades

- 📦 Listagem de produtos
- 🔍 Busca por produtos
- 📊 Visualização de métricas (vendas e avaliações)
- ✏️ CRUD completo de produtos
- ⭐ Média de avaliações por produto

---

## 🧱 Arquitetura

```
📦 projeto
├── backend
│   ├── app
│   │   ├── main.py
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   └── database/
│   ├── seed.py
│   ├── requirements.txt
│   └── alembic/
│
├── frontend
│   └── ecommerce
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── services/
│       │   └── App.tsx
│       ├── package.json
│       └── vite.config.ts
│
└── README.md
```

---

## ⚙️ Tecnologias Utilizadas

### Backend
- Python
- FastAPI
- SQLAlchemy
- Alembic
- SQLite

### Frontend
- React
- TypeScript
- Vite
- pnpm

---

## 🚀 Como executar o projeto

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd <nome-do-projeto>
```

---

## 🔙 Backend

### 2. Acessar a pasta

```bash
cd backend
```

### 3. Criar e ativar ambiente virtual

```bash
python -m venv venv
```

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

---

### 4. Instalar dependências

```bash
pip install -r requirements.txt
```

---

### 5. Atualizar SQLAlchemy (se necessário)

```bash
pip install --upgrade sqlalchemy
```

---

### 6. Popular banco de dados

```bash
python seed.py
```

---

### 7. Executar servidor

```bash
uvicorn app.main:app --reload
```

Acesse: http://127.0.0.1:8000  
Docs: http://127.0.0.1:8000/docs

---

## 🎨 Frontend

### 8. Acessar a pasta

```bash
cd frontend/ecommerce
```

---

### 9. Instalar dependências

```bash
pnpm install
```

Caso necessário:

```bash
pnpm add vite
```

---

### 10. Rodar aplicação

```bash
pnpm run dev
```

Acesse: http://localhost:5173

---

## 🔌 Endpoints da API

### Produtos

| Método | Endpoint        | Descrição                 |
|--------|----------------|---------------------------|
| GET    | /produtos      | Listar produtos          |
| GET    | /produtos/{id} | Buscar produto           |
| POST   | /produtos      | Criar produto            |
| PUT    | /produtos/{id} | Atualizar produto        |
| DELETE | /produtos/{id} | Deletar produto          |

---

## 📄 Licença

MIT
