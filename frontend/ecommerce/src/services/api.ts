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

// Avaliações
export const getAvaliacoes = (limit = 100, offset = 0) =>
  request<Avaliacao[]>(`/avaliacoes?limit=${limit}&offset=${offset}`)

// Itens
export const getItens = (limit = 100, offset = 0) =>
  request<ItemPedido[]>(`/itens?limit=${limit}&offset=${offset}`)