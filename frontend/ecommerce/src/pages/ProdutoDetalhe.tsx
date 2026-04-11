import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProduto, getAvaliacoes, getItens, deleteProduto } from '../services/api'
import type { Produto, Avaliacao, ItemPedido } from '../types'

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg
          key={i}
          className={`w-4 h-4 ${i <= value ? 'text-amber-400' : 'text-stone-700'}`}
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
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [itens, setItens] = useState<ItemPedido[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      getProduto(id),
      getAvaliacoes(1000, 0),
      getItens(1000, 0),
    ]).then(([p, avs, its]) => {
      setProduto(p)
      setAvaliacoes(avs.filter(a => {
        // filtramos via itens do pedido
        const pedidoIds = its.filter(i => i.id_produto === id).map(i => i.id_pedido)
        return pedidoIds.includes(a.id_pedido)
      }))
      setItens(its.filter(i => i.id_produto === id))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  const mediaAvaliacoes = avaliacoes.length > 0
    ? avaliacoes.reduce((sum, a) => sum + a.avaliacao, 0) / avaliacoes.length
    : null

  const totalVendas = itens.length
  const receitaTotal = itens.reduce((sum, i) => sum + i.preco_BRL, 0)

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
            {produto.link_imagem && !imgError ? (
              <img
                src={produto.link_imagem}
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

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
                <p className="text-stone-500 text-xs mb-1">Avaliação</p>
                {mediaAvaliacoes !== null ? (
                  <>
                    <p className="text-white text-2xl font-bold">{mediaAvaliacoes.toFixed(1)}</p>
                    <StarRating value={Math.round(mediaAvaliacoes)} />
                  </>
                ) : (
                  <p className="text-stone-600 text-sm">Sem dados</p>
                )}
              </div>
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
                <p className="text-stone-500 text-xs mb-1">Vendas</p>
                <p className="text-white text-2xl font-bold">{totalVendas}</p>
                <p className="text-stone-600 text-xs">pedidos</p>
              </div>
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
                <p className="text-stone-500 text-xs mb-1">Receita</p>
                <p className="text-amber-400 text-xl font-bold">
                  {receitaTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
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