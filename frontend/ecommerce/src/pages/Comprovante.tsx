import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../components/CartContext'

// ─── Ícones de método de pagamento ────────────────────────────────────────────

const CreditoIcon = () => (
  <svg className="w-4 h-3.5" fill="none" viewBox="0 0 24 14" stroke="currentColor" strokeWidth={1.4}>
    <rect x="0.5" y="0.5" width="23" height="13" rx="2" />
    <path strokeLinecap="round" d="M0 5h24M4 9h5" />
  </svg>
)
const DebitoIcon = () => (
  <svg className="w-4 h-3.5" fill="none" viewBox="0 0 24 14" stroke="currentColor" strokeWidth={1.4}>
    <rect x="0.5" y="0.5" width="23" height="13" rx="2" />
    <path strokeLinecap="round" d="M0 5h24M4 9h3M9 9h3" />
  </svg>
)
const PixIcon = () => (
  <i className="fa-brands fa-pix"></i>
)
const DinheiroIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="3" />
    <path strokeLinecap="round" d="M6 12h.01M18 12h.01" />
  </svg>
)
const VoucherIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6M9 16h4" />
  </svg>
)

const metodoIconMap: Record<string, React.ReactNode> = {
  credito: <CreditoIcon />,
  debito: <DebitoIcon />,
  pix: <PixIcon />,
  dinheiro: <DinheiroIcon />,
  voucher: <VoucherIcon />,
}

// ─── Barcode decorativo ───────────────────────────────────────────────────────

function Barcode() {
  const widths = [2, 1, 3, 1, 2, 2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 3, 1, 2, 1, 1, 2, 3, 1, 2, 1, 2, 3, 1, 1]
  return (
    <div className="flex items-end gap-[2px] h-8">
      {widths.map((w, i) => (
        <div key={i} className="bg-stone-700 rounded-[1px]"
          style={{ width: w, height: 16 + (i % 3) * 6 }} />
      ))}
    </div>
  )
}

// ─── Componente ──────────────────────────────────────────────────────────────

const HexLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 28 28" fill="none">
    <path d="M14 2L26 8.5V19.5L14 26L2 19.5V8.5L14 2Z" stroke="#F59E0B" strokeWidth="1.2" fill="none" />
    <path d="M9.5 14L12.5 17L18.5 11" stroke="#F59E0B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const BoxIcon = () => (
  <svg className="w-5 h-5 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
  </svg>
)

export default function Comprovante() {
  const { cart, clearCart } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  // Dados vindos do Carrinho via navigate('/comprovante', { state: {...} })
  const state = location.state as {
    metodoPagamento?: string
    metodoId?: string
    parcelas?: number
    ultimos4?: string
    numeroPedido?: string
    valorTotal?: number
    itensNoPedido?: any[]
  } | null

  const metodoPagamento = state?.metodoPagamento ?? 'Cartão de Crédito'
  const metodoId = state?.metodoId ?? 'credito'
  const parcelas = state?.parcelas ?? 1
  const ultimos4 = state?.ultimos4 ?? '0000'
  const numeroPedido = state?.numeroPedido ?? `MP-${Date.now().toString().slice(-8)}`

  const now = new Date()
  const dataFormatada = now.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  const horaFormatada = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const subtotal = state?.valorTotal ?? 0
  const itensExibicao = state?.itensNoPedido ?? []
  const totalItens = itensExibicao.reduce((acc, item) => acc + item.quantidade, 0)

  const codigoAutorizacao = `AUTH-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  const nsu = numeroPedido.replace('MP-', '').slice(-6)

  // Detalhe do pagamento (linha secundária)
  const detalhePagamento = (() => {
    if (metodoId === 'pix') return 'Pix — aprovação instantânea'
    if (metodoId === 'dinheiro') return 'Dinheiro — pagamento em espécie'
    if (metodoId === 'voucher') return 'Voucher — vale refeição/alimentação'
    const sufixo = ultimos4 !== '0000' ? ` •••• ${ultimos4}` : ''
    const part = parcelas > 1 ? ` · ${parcelas}× sem juros` : ''
    return `${sufixo}${part}`
  })()

  function handleNovaVenda() {
    clearCart()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#0C0A08] pt-16 pb-12 flex items-start justify-center px-4">
      <div className="w-full max-w-lg mt-10">

        <div className="flex items-center justify-between mb-5">
          <span className="text-stone-600 text-xs font-mono">{dataFormatada} · {horaFormatada}</span>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 bg-stone-900 border border-stone-800
                         text-stone-500 text-xs font-medium rounded-lg
                         hover:border-amber-400/40 hover:text-amber-400 transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir
            </button>
            <button
              onClick={handleNovaVenda}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-400 text-stone-950
                         text-xs font-medium rounded-lg hover:bg-amber-300 transition-colors duration-200"
            >
              Nova venda
            </button>
          </div>
        </div>

        {/* Comprovante */}
        <div className="bg-[#0C0A08] border border-stone-800 rounded-2xl overflow-hidden">

          {/* Cabeçalho */}
          <div className="px-7 pt-7 pb-6 border-b border-stone-900">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 border border-stone-700 rounded-lg flex items-center justify-center shrink-0">
                <HexLogo />
              </div>
              <span className="text-stone-100 font-medium text-base tracking-tight">
                Mercado<span className="text-amber-400">Pro</span>
              </span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              <span className="text-green-500 text-[11px] font-medium tracking-[0.14em] uppercase">
                Venda confirmada
              </span>
            </div>
            <p className="text-stone-50 text-2xl font-medium font-mono tracking-tight">#{numeroPedido}</p>
            <p className="text-stone-600 text-xs font-mono mt-1">{dataFormatada} · {horaFormatada}</p>
          </div>

          {/* Dados do pedido */}
          <div className="px-7 py-5 border-b border-stone-900">
            <p className="text-[10px] font-medium text-stone-600 uppercase tracking-[0.16em] mb-4">Dados do pedido</p>
            <div className="grid grid-cols-2 gap-y-4">
              {[
                { label: 'Loja', value: 'Loja Principal' },
                { label: 'Canal', value: 'MercadoPro' },
                { label: 'Cliente', value: 'Balcão / PDV' },
                { label: 'Operador', value: 'Admin' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[11px] text-stone-600">{label}</p>
                  <p className="text-stone-300 text-sm font-medium mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Itens */}
          <div className="px-7 py-5 border-b border-stone-900">
            <p className="text-[10px] font-medium text-stone-600 uppercase tracking-[0.16em] mb-4">
              Itens · {totalItens} {totalItens === 1 ? 'produto' : 'produtos'}
            </p>
            {cart.length === 0 ? (
              <p className="text-stone-700 text-sm">Nenhum item.</p>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.id_produto} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-stone-900 border border-stone-800 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                      {item.imagem_url
                        ? <img src={item.imagem_url} alt={item.nome_produto} className="w-full h-full object-cover" />
                        : <BoxIcon />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-stone-300 text-sm font-medium truncate">{item.nome_produto}</p>
                      <p className="text-stone-600 text-xs font-mono mt-0.5">
                        {item.quantidade}× {(item.preco_medio || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                    <span className="text-amber-400 text-sm font-medium font-mono shrink-0">
                      {((item.preco_medio || 0) * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totais */}
          <div className="px-7 py-5 border-b border-stone-900">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-stone-600 text-xs">Subtotal</span>
                <span className="text-stone-400 text-xs font-mono">
                  {subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600 text-xs">Frete</span>
                <span className="text-stone-600 text-xs italic">Grátis</span>
              </div>
            </div>
            <div className="border-t border-dashed border-stone-800 my-4" />
            <div className="flex items-baseline justify-between">
              <span className="text-stone-300 text-sm font-medium">Total</span>
              <span className="text-amber-400 text-xl font-medium font-mono tracking-tight">
                {subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            {parcelas > 1 && (
              <p className="text-stone-600 text-[11px] font-mono text-right mt-1">
                {parcelas}× de {(subtotal / parcelas).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} sem juros
              </p>
            )}
          </div>

          {/* Pagamento — dinâmico */}
          <div className="px-7 py-5 border-b border-stone-900">
            <p className="text-[10px] font-medium text-stone-600 uppercase tracking-[0.16em] mb-4">Pagamento</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-6 bg-stone-900 border border-stone-800 rounded-[4px] flex items-center justify-center text-stone-500">
                  {metodoIconMap[metodoId] ?? <CreditoIcon />}
                </div>
                <div>
                  <p className="text-stone-300 text-sm font-medium">{metodoPagamento}</p>
                  {detalhePagamento && (
                    <p className="text-stone-600 text-[11px] font-mono mt-0.5">{detalhePagamento}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 border border-green-500/20">
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-500 text-[11px] font-medium">Aprovado</span>
              </div>
            </div>
          </div>

          {/* Rodapé */}
          <div className="px-7 py-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] text-stone-700 uppercase tracking-[0.12em] mb-1.5">Código de autorização</p>
              <p className="text-stone-600 text-[11px] font-mono">{codigoAutorizacao} · NSU {nsu}</p>
              <div className="mt-3"><Barcode /></div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-stone-700 uppercase tracking-[0.12em] mb-1">Obrigado!</p>
              <p className="text-stone-600 text-[11px] leading-relaxed max-w-[120px]">
                Volte sempre à loja MercadoPro.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 text-center">
          <Link to="/"
            className="text-stone-700 text-xs hover:text-amber-400 transition-colors duration-150 inline-flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar ao catálogo
          </Link>
        </div>
      </div>
    </div>
  )
}