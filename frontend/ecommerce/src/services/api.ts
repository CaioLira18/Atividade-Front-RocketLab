import type { Produto, ProdutoUpdate, Avaliacao, ItemPedido } from '../types'

const BASE_URL = 'http://localhost:8000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`)
  return res.json()
}

// Produtos
export const getProdutos = (limit = 20, offset = 0) =>
  request<Produto[]>(`/produtos?limit=${limit}&offset=${offset}`)

export const getProduto = (id: string) =>
  request<Produto>(`/produtos/${id}`)

export const createProduto = (dados: ProdutoUpdate) =>
  request<Produto>('/produtos', { method: 'POST', body: JSON.stringify(dados) })

export const updateProduto = (id: string, dados: ProdutoUpdate) =>
  request<Produto>(`/produtos/${id}`, { method: 'PUT', body: JSON.stringify(dados) })

export const deleteProduto = (id: string) =>
  request(`/produtos/${id}`, { method: 'DELETE' })

// Preço e vendas do produto (join no backend)
export const getPrecoProduto = (id: string) =>
  request<{
    preco_medio: number | null
    preco_min: number | null
    preco_max: number | null
    total_vendas: number
  }>(`/produtos/${id}/preco`)

// Avaliações de um produto específico
export const getAvaliacoesProduto = (id: string) =>
  request<Avaliacao[]>(`/produtos/${id}/avaliacoes`)

// Avaliações gerais
export const getAvaliacoes = (limit = 20, offset = 0) =>
  request<Avaliacao[]>(`/avaliacoes?limit=${limit}&offset=${offset}`)

// Itens
export const getItens = (limit = 20, offset = 0) =>
  request<ItemPedido[]>(`/itens?limit=${limit}&offset=${offset}`)