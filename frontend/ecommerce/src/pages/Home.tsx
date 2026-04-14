import { useState, useEffect, useCallback } from 'react'
import { getProdutos } from '../services/api'
import type { Produto } from '../types'
import ProductCard from './ProductCard'

const LIMIT = 20

const HexLogo = () => (
  <svg className="w-7 h-7" viewBox="0 0 28 28" fill="none">
    <path d="M14 2L26 8.5V19.5L14 26L2 19.5V8.5L14 2Z"
      stroke="#F59E0B" strokeWidth="1.2" fill="none" />
    <path d="M9.5 14L12.5 17L18.5 11"
      stroke="#F59E0B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

const SearchIcon = () => (
  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none"
    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

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

  useEffect(() => { fetchProdutos(true) }, [])

  useEffect(() => {
    const onFocus = () => fetchProdutos(true)
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  const categorias = [...new Set(produtos.map(p => p.categoria_produto))].sort()

  const filtrados = produtos.filter(p => {
    const buscaOk = p.nome_produto.toLowerCase().includes(busca.toLowerCase()) ||
      p.categoria_produto.toLowerCase().includes(busca.toLowerCase())
    const catOk = !categoria || p.categoria_produto === categoria
    return buscaOk && catOk
  })

  return (
    <div className="min-h-screen bg-[#0C0A08] pt-16">

      {/* Hero / Header */}
      <div className="border-b border-stone-900 bg-[#0C0A08]/95 backdrop-blur-md sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-medium text-stone-50 tracking-tight leading-none">
                Catálogo de Produtos
              </h1>
              <p className="mt-2 text-stone-500 text-sm">
                <span className="text-stone-300 font-medium font-mono">{produtos.length}</span>
                {' '}produtos carregados
              </p>
            </div>
          </div>

          {/* Busca e filtro */}
          <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <SearchIcon />
              <input
                type="text"
                placeholder="Buscar produto ou categoria..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 text-stone-100 placeholder-stone-600
                           rounded-lg pl-10 pr-4 py-2.5 text-sm
                           focus:outline-none focus:border-amber-400/50 focus:bg-stone-800/80
                           transition-all duration-200"
              />
            </div>
            <select
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              className="bg-stone-900 border border-stone-800 text-stone-400 rounded-lg px-4 py-2.5 text-sm
                         focus:outline-none focus:border-amber-400/50
                         transition-all duration-200 min-w-[180px]"
            >
              <option value="">Todas as categorias</option>
              {categorias.map(c => (
                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <button
              onClick={() => fetchProdutos(true)}
              title="Atualizar"
              className="px-3 py-2.5 bg-stone-900 border border-stone-800 text-stone-500
                         rounded-lg hover:border-amber-400/40 hover:text-amber-400
                         transition-all duration-200 flex items-center justify-center"
            >
              <RefreshIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-stone-900 border border-stone-800/50 rounded-xl overflow-hidden animate-pulse">
                <div className="h-48 bg-stone-800/60" />
                <div className="p-4 space-y-3">
                  <div className="h-3.5 bg-stone-800 rounded-md w-4/5" />
                  <div className="h-3 bg-stone-800 rounded-md w-2/5" />
                  <div className="h-px bg-stone-800 mt-2" />
                  <div className="flex justify-between">
                    <div className="h-3.5 bg-stone-800 rounded-md w-1/3" />
                    <div className="h-3 bg-stone-800 rounded-md w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full
                            bg-red-950 border border-red-900 mb-4">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-stone-400 text-base mb-5">{error}</p>
            <button
              onClick={() => fetchProdutos(true)}
              className="px-6 py-2.5 bg-amber-400 text-stone-950 text-sm font-medium rounded-lg
                         hover:bg-amber-300 transition-colors duration-200"
            >
              Tentar novamente
            </button>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-stone-600 text-base">Nenhum produto encontrado.</p>
            {(busca || categoria) && (
              <button
                onClick={() => { setBusca(''); setCategoria('') }}
                className="mt-4 text-amber-400 text-sm hover:underline"
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Contador de resultados ao filtrar */}
            {(busca || categoria) && (
              <p className="text-stone-600 text-xs mb-5 font-mono">
                {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtrados.map(p => (
                <ProductCard key={p.id_produto} produto={p} />
              ))}
            </div>

            {hasMore && !busca && !categoria && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => fetchProdutos()}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-stone-900 border border-stone-800 text-stone-400 text-sm font-medium
                             rounded-lg hover:border-amber-400/40 hover:text-amber-400
                             disabled:opacity-40 disabled:cursor-not-allowed
                             transition-all duration-200 flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                      </svg>
                      Carregando...
                    </>
                  ) : 'Carregar mais'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}