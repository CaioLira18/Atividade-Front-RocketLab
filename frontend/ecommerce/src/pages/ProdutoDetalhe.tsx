import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProduto, getPrecoProduto, getAvaliacoesProduto, deleteProduto } from '../services/api'
import type { Produto, Avaliacao } from '../types'

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg
          key={i}
          className={`w-4 h-4 ${i <= Math.round(value) ? 'text-amber-400' : 'text-stone-700'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function ProdutoDetalhe() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [produto, setProduto] = useState<Produto | null>(null)
  const [preco, setPreco] = useState<{ preco_medio: number | null; total_vendas: number; preco_min: number | null; preco_max: number | null } | null>(null)
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [mediaAval, setMediaAval] = useState<number | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      getProduto(id),
      getPrecoProduto(id),
      getAvaliacoesProduto(id),
    ]).then(([p, pr, avs]) => {
      setProduto(p)
      setPreco(pr)
      setAvaliacoes(avs)
      if (avs.length > 0) {
        setMediaAval(avs.reduce((sum, a) => sum + a.avaliacao, 0) / avs.length)
      }
    }).catch(() => {
      setProduto(null)
    }).finally(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    if (!produto) return
    if (!confirm(`Remover "${produto.nome_produto}"?`)) return
    setDeleting(true)
    try {
      await deleteProduto(produto.id_produto)
      navigate('/')
    } catch {
      alert('Erro ao remover produto.')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 pt-16 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!produto) {
    return (
      <div className="min-h-screen bg-stone-950 pt-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-400 text-lg">Produto não encontrado.</p>
          <Link to="/" className="mt-4 inline-block text-amber-400 hover:underline">← Voltar</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-950 pt-16">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-stone-500 mb-8">
          <Link to="/" className="hover:text-amber-400 transition-colors">Catálogo</Link>
          <span>/</span>
          <span className="text-stone-300 truncate max-w-xs">{produto.nome_produto}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Imagem */}
          <div className="rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 aspect-square flex items-center justify-center">
            {produto.imagem_url && !imgError ? (
              <img
                src={produto.imagem_url}
                alt={produto.nome_produto}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-stone-600">
                <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                </svg>
                <span className="text-sm">Sem imagem</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
            <div>
              <span className="px-3 py-1 bg-amber-400/10 text-amber-400 text-xs font-medium rounded-full">
                {produto.categoria_produto.replace(/_/g, ' ')}
              </span>
              <h1 className="mt-3 text-3xl font-bold text-white leading-tight">
                {produto.nome_produto}
              </h1>
              <p className="mt-2 text-stone-500 font-mono text-xs">ID: {produto.id_produto}</p>
            </div>

            {/* Preço destaque */}
            {preco?.preco_medio && (
              <div className="bg-stone-900 border border-amber-400/20 rounded-xl p-5">
                <p className="text-stone-500 text-xs mb-1">Preço médio de venda</p>
                <p className="text-amber-400 text-3xl font-bold">
                  {preco.preco_medio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                {preco.preco_min !== preco.preco_max && (
                  <p className="text-stone-500 text-xs mt-1">
                    Min: {preco.preco_min?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ·
                    Max: {preco.preco_max?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
                <p className="text-stone-500 text-xs mb-1">Avaliação média</p>
                {mediaAval !== null ? (
                  <>
                    <p className="text-white text-2xl font-bold">{mediaAval.toFixed(1)}</p>
                    <StarRating value={mediaAval} />
                    <p className="text-stone-600 text-xs mt-1">{avaliacoes.length} avaliações</p>
                  </>
                ) : (
                  <p className="text-stone-600 text-sm mt-1">Sem avaliações</p>
                )}
              </div>
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
                <p className="text-stone-500 text-xs mb-1">Total vendido</p>
                <p className="text-white text-2xl font-bold">{preco?.total_vendas ?? 0}</p>
                <p className="text-stone-600 text-xs">pedidos</p>
              </div>
            </div>

            {/* Medidas */}
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
              <h3 className="text-stone-400 text-xs font-medium uppercase tracking-wider mb-4">Especificações</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Peso', value: produto.peso_produto_gramas ? `${produto.peso_produto_gramas}g` : '—' },
                  { label: 'Comprimento', value: produto.comprimento_centimetros ? `${produto.comprimento_centimetros}cm` : '—' },
                  { label: 'Altura', value: produto.altura_centimetros ? `${produto.altura_centimetros}cm` : '—' },
                  { label: 'Largura', value: produto.largura_centimetros ? `${produto.largura_centimetros}cm` : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-stone-800">
                    <span className="text-stone-500">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-3">
              <Link
                to={`/produtos/${produto.id_produto}/editar`}
                className="flex-1 text-center px-5 py-3 bg-amber-400 text-stone-950 font-semibold rounded-lg hover:bg-amber-300 transition-colors"
              >
                Editar produto
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-3 bg-stone-900 border border-red-900 text-red-400 font-medium rounded-lg hover:bg-red-950 hover:border-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? '...' : 'Remover'}
              </button>
            </div>
          </div>
        </div>

        {/* Avaliações */}
        {avaliacoes.length > 0 && (
          <div className="mt-14">
            <h2 className="text-xl font-bold text-white mb-6">
              Avaliações <span className="text-stone-500 font-normal text-base">({avaliacoes.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {avaliacoes.slice(0, 10).map(av => (
                <div key={av.id_avaliacao} className="bg-stone-900 border border-stone-800 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <StarRating value={av.avaliacao} />
                    {av.data_comentario && (
                      <span className="text-stone-600 text-xs shrink-0">
                        {new Date(av.data_comentario).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                  {av.titulo_comentario && (
                    <p className="text-white font-medium text-sm mb-1">{av.titulo_comentario}</p>
                  )}
                  {av.comentario && (
                    <p className="text-stone-400 text-sm leading-relaxed">{av.comentario}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}