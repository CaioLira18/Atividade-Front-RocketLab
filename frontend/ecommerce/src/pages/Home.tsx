import { useState, useEffect, useCallback } from 'react'
import type { Produto } from '../types/'
import ProductCard from '../pages/ProductCard'
import { getProduto, getProdutos } from '../services/api'

const LIMIT = 20

export default function Home() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busca, setBusca] = useState('')
  const [categoria, setCategoria] = useState('')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchProdutos = useCallback(async (reset = false) => {
    try {
      const offset = reset ? 0 : page * LIMIT
      if (reset) setLoading(true)
      else setLoadingMore(true)

      const data = await getProdutos(LIMIT, offset)
      if (reset) {
        setProdutos(data)
        setPage(1)
      } else {
        setProdutos(prev => [...prev, ...data])
        setPage(prev => prev + 1)
      }
      setHasMore(data.length === LIMIT)
    } catch {
      setError('Não foi possível carregar os produtos.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [page])

  useEffect(() => {
    fetchProdutos(true)
  }, [])

  const categorias = [...new Set(produtos.map(p => p.categoria_produto))].sort()

  const filtrados = produtos.filter(p => {
    const buscaOk = p.nome_produto.toLowerCase().includes(busca.toLowerCase()) ||
      p.categoria_produto.toLowerCase().includes(busca.toLowerCase())
    const catOk = !categoria || p.categoria_produto === categoria
    return buscaOk && catOk
  })

  return (
    <div className="min-h-screen bg-stone-950 pt-16">
      {/* Hero */}
      <div className="border-b border-stone-800 bg-stone-950">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <p className="text-amber-400 text-sm font-medium tracking-widest uppercase mb-2">
            Painel do Gerente
          </p>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Catálogo de Produtos
          </h1>
          <p className="mt-2 text-stone-400 text-lg">
            {produtos.length} produtos carregados
          </p>

          {/* Busca e filtro */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar produto..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 text-white placeholder-stone-500 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <select
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              className="bg-stone-900 border border-stone-700 text-stone-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition-colors"
            >
              <option value="">Todas as categorias</option>
              {categorias.map(c => (
                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden animate-pulse">
                <div className="h-48 bg-stone-800" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-stone-800 rounded w-3/4" />
                  <div className="h-3 bg-stone-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 text-lg">{error}</p>
            <button
              onClick={() => fetchProdutos(true)}
              className="mt-4 px-6 py-2 bg-amber-400 text-stone-950 rounded-lg font-medium hover:bg-amber-300 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-stone-500 text-lg">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtrados.map(p => (
                <ProductCard key={p.id_produto} produto={p} />
              ))}
            </div>

            {/* Load more */}
            {hasMore && !busca && !categoria && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => fetchProdutos()}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-stone-900 border border-stone-700 text-stone-300 rounded-lg font-medium hover:border-amber-400 hover:text-amber-400 transition-all disabled:opacity-50"
                >
                  {loadingMore ? 'Carregando...' : 'Carregar mais'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}