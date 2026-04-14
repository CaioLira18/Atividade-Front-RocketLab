import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../components/CartContext'
import { useToast } from '../components/ToastContext'

const BoxIcon = ({ className }: { className?: string }) => (
  <svg className={className ?? 'w-7 h-7 text-stone-700'} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
  </svg>
)

const CartEmptyIcon = () => (
  <svg className="w-14 h-14 text-stone-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

type MetodoId = 'credito' | 'debito' | 'pix' | 'dinheiro' | 'voucher'

interface Metodo {
  id: MetodoId
  label: string
  descricao: string
  icon: React.ReactNode
  temParcelas?: boolean
  temDigitos?: boolean
}

const CreditoIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path strokeLinecap="round" d="M2 10h20M6 15h4" />
  </svg>
)

const DebitoIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path strokeLinecap="round" d="M2 10h20M6 15h2M10 15h2" />
  </svg>
)

const PixIcon = () => (
  <i className="fa-brands fa-pix"></i>
)

const DinheiroIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="3" />
    <path strokeLinecap="round" d="M6 12h.01M18 12h.01" />
  </svg>
)

const VoucherIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6M9 16h4" />
  </svg>
)

const METODOS: Metodo[] = [
  { id: 'credito', label: 'Crédito', descricao: 'Parcelamento disponível', icon: <CreditoIcon />, temParcelas: true, temDigitos: true },
  { id: 'debito', label: 'Débito', descricao: 'Aprovação imediata', icon: <DebitoIcon />, temDigitos: true },
  { id: 'pix', label: 'Pix', descricao: 'Transferência instantânea', icon: <PixIcon /> },
  { id: 'dinheiro', label: 'Dinheiro', descricao: 'Pagamento em espécie', icon: <DinheiroIcon /> },
  { id: 'voucher', label: 'Voucher', descricao: 'Vale-alimentação / refeição', icon: <VoucherIcon /> },
]

const PARCELAS = [1, 2, 3, 4, 5, 6, 10, 12]

export default function Carrinho() {
  const { cart, removeFromCart, clearCart } = useCart()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [metodoSelecionado, setMetodoSelecionado] = useState<MetodoId>('credito')
  const [parcelas, setParcelas] = useState(1)
  const [ultimos4, setUltimos4] = useState('')
  const [finalizando, setFinalizando] = useState(false)

  const totalGeral = cart.reduce((acc, item) => acc + (item.preco_medio || 0) * item.quantidade, 0)
  const metodoAtual = METODOS.find(m => m.id === metodoSelecionado)!
  const valorParcela = parcelas > 1
    ? (totalGeral / parcelas).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : null

  function handleFinalizar() {
    setFinalizando(true)
    if (cart.length === 0) {
      showToast('O carrinho está vazio!', { type: 'error' })
      setFinalizando(false)
      return
    }

    // Captura os dados antes de limpar o carrinho
    const dadosFinalizacao = {
      metodoPagamento: metodoAtual.label,
      metodoId: metodoAtual.id,
      parcelas,
      ultimos4: ultimos4 || '0000',
      numeroPedido: `MP-${Date.now().toString().slice(-8)}`,
      valorTotal: totalGeral, // Envia o total calculado
      itensNoPedido: [...cart] // Envia uma cópia dos itens
    }

    setTimeout(() => {
      showToast('Venda finalizada com sucesso!', { type: 'success' })
      clearCart() // Agora pode limpar o carrinho
      navigate('/comprovante', { state: dadosFinalizacao })
    }, 800)
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#0C0A08] pt-16 flex items-center justify-center px-6">
        <div className="text-center flex flex-col items-center gap-5">
          <div className="w-24 h-24 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center">
            <CartEmptyIcon />
          </div>
          <div>
            <h2 className="text-lg font-medium text-stone-300">Carrinho vazio</h2>
            <p className="text-stone-600 text-sm mt-1">Adicione produtos do catálogo.</p>
          </div>
          <Link to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 text-stone-950 text-sm font-medium rounded-lg hover:bg-amber-300 transition-colors duration-200">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Ir ao catálogo
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0C0A08] pt-16">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <span className="text-amber-400 text-[10px] font-medium tracking-[0.18em] uppercase">Resumo do pedido</span>
          <div className="flex items-end justify-between mt-1.5">
            <h1 className="text-2xl font-medium text-stone-50 tracking-tight">Carrinho de Compras</h1>
            <button onClick={clearCart}
              className="text-stone-700 text-xs hover:text-red-400 transition-colors duration-150 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Limpar tudo
            </button>
          </div>
          <div className="mt-4 h-px bg-stone-900" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

          {/* Coluna esquerda */}
          <div className="flex flex-col gap-5">

            {/* Itens */}
            <div className="space-y-2.5">
              {cart.map((item, index) => (
                <div key={item.id_produto}
                  className="group flex items-center gap-4 p-4 bg-stone-900 border border-stone-800 rounded-xl hover:border-stone-700 transition-all duration-200">
                  <span className="text-stone-800 text-xs font-mono w-4 shrink-0 text-center select-none">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="w-14 h-14 bg-stone-800 border border-stone-700/50 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                    {item.imagem_url
                      ? <img src={item.imagem_url} alt={item.nome_produto} className="w-full h-full object-cover" />
                      : <BoxIcon className="w-6 h-6 text-stone-700" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-stone-200 text-sm font-medium leading-snug truncate">{item.nome_produto}</h3>
                    <p className="text-stone-600 text-xs mt-0.5 font-mono">
                      {item.quantidade}× {item.preco_medio?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                  <span className="text-amber-400 text-sm font-medium font-mono shrink-0">
                    {((item.preco_medio || 0) * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                  <button onClick={() => removeFromCart(item.id_produto)}
                    className="bg-red-500 hover:bg-red-600 text-stone-500 hover:text-red-400 shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 opacity-0 group-hover:opacity-100">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Pagamento */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
              <p className="text-[10px] font-medium text-stone-600 uppercase tracking-[0.16em] mb-4">
                Método de pagamento
              </p>

              {/* Botões de método */}
              <div className="grid grid-cols-5 gap-2 mb-5">
                {METODOS.map(m => (
                  <button key={m.id}
                    onClick={() => { setMetodoSelecionado(m.id); setParcelas(1) }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200
                                ${metodoSelecionado === m.id
                        ? 'border-amber-400/50 bg-amber-400/5 text-amber-400'
                        : 'border-stone-800 text-stone-500 hover:border-stone-700 hover:text-stone-300'
                      }`}
                  >
                    {m.icon}
                    <span className="text-[10px] font-medium">{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Detalhes */}
              <div className="border-t border-stone-800 pt-4 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-stone-500 text-xs">{metodoAtual.descricao}</span>
                </div>

                {/* Dígitos do cartão */}
                {metodoAtual.temDigitos && (
                  <div>
                    <label className="text-[10px] text-stone-600 uppercase tracking-widest block mb-2">
                      Últimos 4 dígitos
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      value={ultimos4}
                      onChange={e => setUltimos4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="0000"
                      className="w-28 bg-stone-800 border border-stone-700 text-stone-200 text-sm font-mono
                      rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400/50 transition-colors"
                    />
                  </div>
                )}

                {/* Parcelas */}
                {metodoAtual.temParcelas && (
                  <div>
                    <label className="text-[10px] text-stone-600 uppercase tracking-widest block mb-2">
                      Parcelamento
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {PARCELAS.map(n => {
                        const val = (totalGeral / n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        return (
                          <button key={n} onClick={() => setParcelas(n)}
                            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-mono transition-all duration-150
                                        ${parcelas === n
                                ? 'border-amber-400/50 bg-amber-400/10 text-amber-400'
                                : 'border-stone-700 text-stone-500 hover:border-stone-600 hover:text-stone-300'
                              }`}
                          >
                            {n}× {val}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Pix */}
                {metodoSelecionado === 'pix' && (
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg border border-stone-700 bg-stone-800 flex items-center justify-center shrink-0">
                      <svg className="w-10 h-10 text-stone-500" viewBox="0 0 40 40" fill="currentColor">
                        <rect x="4" y="4" width="14" height="14" rx="1" />
                        <rect x="22" y="4" width="14" height="14" rx="1" />
                        <rect x="4" y="22" width="14" height="14" rx="1" />
                        <rect x="7" y="7" width="8" height="8" rx="0.5" fill="#1C1917" />
                        <rect x="25" y="7" width="8" height="8" rx="0.5" fill="#1C1917" />
                        <rect x="7" y="25" width="8" height="8" rx="0.5" fill="#1C1917" />
                        <rect x="22" y="22" width="5" height="5" rx="0.5" />
                        <rect x="29" y="22" width="7" height="3" rx="0.5" />
                        <rect x="22" y="29" width="7" height="7" rx="0.5" />
                        <rect x="31" y="27" width="5" height="9" rx="0.5" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-stone-300 text-xs font-medium">Escaneie o QR Code</p>
                      <p className="text-stone-600 text-[11px] font-mono mt-1">Expira em 10:00 min</p>
                      <p className="text-stone-700 text-[11px] mt-0.5">mercadopro@loja.com.br</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Coluna direita: resumo */}
          <div className="lg:sticky lg:top-24 flex flex-col gap-4">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">

              <p className="text-[10px] font-medium text-stone-600 uppercase tracking-[0.16em] mb-4">Resumo</p>

              <div className="space-y-2.5 pb-4 border-b border-stone-800">
                <div className="flex justify-between">
                  <span className="text-stone-500 text-sm">
                    Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'itens'})
                  </span>
                  <span className="text-stone-300 font-mono text-xs">
                    {totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 text-sm">Frete</span>
                  <span className="text-stone-600 text-xs italic">a calcular</span>
                </div>
              </div>

              <div className="pt-4 mb-5">
                <p className="text-stone-600 text-[10px] uppercase tracking-widest">Total</p>
                <p className="text-2xl font-medium text-stone-50 font-mono tracking-tight mt-0.5">
                  {totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                {valorParcela && (
                  <p className="text-stone-600 text-[11px] font-mono mt-1">
                    {parcelas}× de {valorParcela} sem juros
                  </p>
                )}
              </div>

              {/* Método resumido */}
              <div className="flex items-center gap-3 p-3 bg-stone-800 rounded-xl mb-4 border border-stone-700/50">
                <span className="text-amber-400 shrink-0">{metodoAtual.icon}</span>
                <div className="min-w-0">
                  <p className="text-stone-300 text-xs font-medium">{metodoAtual.label}</p>
                  <p className="text-stone-600 text-[11px] font-mono truncate">
                    {metodoAtual.temDigitos && ultimos4 ? `•••• ${ultimos4}` : metodoAtual.descricao}
                    {metodoAtual.temParcelas && parcelas > 1 ? ` · ${parcelas}×` : ''}
                  </p>
                </div>
              </div>

              <button
                onClick={handleFinalizar}
                disabled={finalizando}
                className="w-full py-3.5 bg-amber-400 text-stone-950 text-sm font-medium rounded-xl
                           hover:bg-amber-300 active:scale-[0.98] disabled:opacity-60
                           transition-all duration-200 flex items-center justify-center gap-2"
              >
                {finalizando ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                    </svg>
                    Processando...
                  </>
                ) : (
                  <>
                    Finalizar Venda
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <Link to="/"
                className="text-stone-700 text-xs hover:text-amber-400 transition-colors duration-150 inline-flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Continuar comprando
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}