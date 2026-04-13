import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProduto, getPrecoProduto, getAvaliacoesProduto, deleteProduto } from '../services/api'
import type { Produto, Avaliacao } from '../types'
import { useCart } from '../components/CartContext'

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i}
          className={`w-3.5 h-3.5 ${i <= Math.round(value) ? 'text-amber-400' : 'text-stone-800'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

const HexCheck = () => (
  <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 16 16" fill="none">
    <path d="M8 1.5L14 5v6L8 14.5L2 11V5L8 1.5Z" stroke="currentColor" strokeWidth="1" />
    <path d="M5.5 8L7 9.5L10.5 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const BoxIcon = () => (
  <svg className="w-16 h-16 text-stone-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.7}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
  </svg>
)

export default function ProdutoDetalhe() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [produto, setProduto] = useState<Produto | null>(null)
  const [preco, setPreco] = useState<{
    preco_medio: number | null
    total_vendas: number
    preco_min: number | null
    preco_max: number | null
  } | null>(null)
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
      if (avs.length > 0)
        setMediaAval(avs.reduce((sum, a) => sum + a.avaliacao, 0) / avs.length)
    }).catch(() => setProduto(null))
      .finally(() => setLoading(false))
  }, [id])

  // FUNÇÃO CORRIGIDA: Anexa o preço ao produto antes de enviar para o carrinho
  const handleAddToCart = () => {
    if (!produto) return
    const produtoComPreco = {
      ...produto,
      preco_medio: preco?.preco_medio || 0 // Pega o valor que já aparece no detalhe
    }
    addToCart(produtoComPreco)
  }

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
      <div className="min-h-screen bg-[#0C0A08] pt-16 flex items-center justify-center">
        <div className="w-7 h-7 border border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!produto) {
    return (
      <div className="min-h-screen bg-[#0C0A08] pt-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-500 text-base">Produto não encontrado.</p>
          <Link to="/" className="mt-4 inline-block text-amber-400 text-sm hover:underline">← Voltar ao catálogo</Link>
        </div>
      </div>
    )
  }

  const specs = [
    { label: 'Peso', value: produto.peso_produto_gramas ? `${produto.peso_produto_gramas}g` : null },
    { label: 'Comprimento', value: produto.comprimento_centimetros ? `${produto.comprimento_centimetros}cm` : null },
    { label: 'Altura', value: produto.altura_centimetros ? `${produto.altura_centimetros}cm` : null },
    { label: 'Largura', value: produto.largura_centimetros ? `${produto.largura_centimetros}cm` : null },
  ]

  return (
    <div className="min-h-screen bg-[#0C0A08] pt-16">
      <div className="max-w-6xl mx-auto px-6 py-10">

        <nav className="flex items-center gap-2 text-xs text-stone-600 mb-10">
          <Link to="/" className="hover:text-amber-400 transition-colors duration-150">Catálogo</Link>
          <span>/</span>
          <span className="text-stone-400 truncate max-w-sm">{produto.nome_produto}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 aspect-square flex items-center justify-center relative">
          
            <script>
              console.log("imagem_url:", {produto.imagem_url});
            </script>

            {produto.imagem_url ? (
              <img
                src={produto.imagem_url}
                alt={produto.nome_produto}
                className={`w-full h-full object-cover transition-opacity duration-300 ${imgError ? 'opacity-0' : 'opacity-100'}`}
                onError={(e) => {
                  console.error("Erro ao carregar imagem:", produto.imagem_url);
                  setImgError(true);
                }}
              />
            ) : null}

            {/* Se não houver URL OU se der erro no carregamento, mostra o ícone */}
            {(!produto.imagem_url || imgError) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-stone-700 bg-stone-900">
                <BoxIcon />
                <span className="text-xs text-stone-700">Sem imagem disponível</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-400/10 text-amber-400 text-[11px] font-medium tracking-wide border border-amber-400/15">
                <HexCheck />
                {produto.categoria_produto.replace(/_/g, ' ')}
              </span>
              <h1 className="mt-3 text-2xl font-medium text-stone-50 leading-snug tracking-tight">
                {produto.nome_produto}
              </h1>
            </div>

            {preco?.preco_medio && (
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
                <p className="text-stone-600 text-[10px] uppercase tracking-widest mb-2">Preço médio de venda</p>
                <p className="text-amber-400 text-3xl font-medium font-mono tracking-tight">
                  {preco.preco_medio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
                <p className="text-stone-600 text-[10px] uppercase tracking-widest mb-2">Avaliação média</p>
                {mediaAval !== null ? (
                  <>
                    <p className="text-stone-100 text-2xl font-medium font-mono">{mediaAval.toFixed(1)}</p>
                    <div className="mt-1.5"><StarRating value={mediaAval} /></div>
                  </>
                ) : (
                  <p className="text-stone-700 text-sm mt-1">Sem avaliações</p>
                )}
              </div>
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
                <p className="text-stone-600 text-[10px] uppercase tracking-widest mb-2">Total vendido</p>
                <p className="text-stone-100 text-2xl font-medium font-mono">{preco?.total_vendas ?? 0}</p>
                <p className="text-stone-700 text-[11px] mt-1.5">pedidos</p>
              </div>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
              <p className="text-stone-600 text-[10px] uppercase tracking-widest mb-4">Especificações</p>
              <div className="grid grid-cols-2 gap-0">
                {specs.map(({ label, value }, i) => (
                  <div key={label}
                    className={`flex justify-between items-center py-2.5 text-sm
                                ${i < specs.length - 2 ? 'border-b border-stone-800' : ''}
                                ${i % 2 === 0 ? 'pr-4 border-r border-stone-800' : 'pl-4'}`}>
                    <span className="text-stone-600 text-xs">{label}</span>
                    <span className={`text-xs font-mono font-medium ${value ? 'text-stone-200' : 'text-stone-700'}`}>
                      {value ?? '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleAddToCart}
                className="w-full py-3.5 bg-amber-400 text-stone-950 text-sm font-medium rounded-xl hover:bg-amber-300 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Adicionar ao Carrinho
              </button>

              <div className="flex gap-2.5">
                <Link
                  to={`/produtos/${produto.id_produto}/editar`}
                  className="flex-1 text-center py-3 bg-stone-900 border border-stone-700 text-stone-300 text-sm font-medium rounded-xl hover:border-stone-600 hover:text-stone-100 transition-all duration-200"
                >
                  Editar produto
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-5 py-3 bg-stone-900 border border-red-950 text-red-500 text-sm font-medium rounded-xl hover:bg-red-950/50 hover:border-red-900 disabled:opacity-40 transition-all duration-200"
                >
                  {deleting ? '...' : 'Remover'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {avaliacoes.length > 0 && (
          <div className="mt-16">
            <h2 className="text-lg font-medium text-stone-100 mb-6">Avaliações</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {avaliacoes.slice(0, 10).map(av => (
                <div key={av.id_avaliacao} className="bg-stone-900 border border-stone-800 rounded-xl p-5 hover:border-stone-700 transition-colors">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <StarRating value={av.avaliacao} />
                  </div>
                  {av.titulo_comentario && <p className="text-stone-200 text-sm font-medium mb-1.5">{av.titulo_comentario}</p>}
                  {av.comentario && <p className="text-stone-500 text-sm leading-relaxed">{av.comentario}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}