import { Link, useLocation } from 'react-router-dom'
import { useCart } from './CartContext'

const HexLogo = () => (
  <svg className="w-6 h-6" viewBox="0 0 28 28" fill="none">
    <path d="M14 2L26 8.5V19.5L14 26L2 19.5V8.5L14 2Z"
      stroke="#F59E0B" strokeWidth="1.2" fill="none" />
    <path d="M9.5 14L12.5 17L18.5 11"
      stroke="#F59E0B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const CartIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const PlusIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
)

export default function Navbar() {
  const { pathname } = useLocation()
  const { totalItens } = useCart()

  const links = [
    { to: '/', label: 'Catálogo' },
    { to: '/produtos/novo', label: 'Novo Produto', icon: <PlusIcon /> },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0C0A08]/95 backdrop-blur-md border-b border-stone-900">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-stone-900 border border-stone-800 rounded-lg
                          flex items-center justify-center
                          group-hover:border-amber-400/30 transition-colors duration-200">
            <HexLogo />
          </div>
          <span className="text-stone-100 font-medium tracking-tight text-base leading-none">
            Mercado<span className="text-amber-400">Pro</span>
          </span>
        </Link>

        {/* Ações */}
        <div className="flex items-center gap-1.5">

          {/* Links de nav */}
          <nav className="flex items-center gap-0.5 mr-2">
            {links.map(({ to, label, icon }) => {
              const active = pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium
                              transition-all duration-200
                              ${active
                                ? 'bg-amber-400 text-stone-950'
                                : 'text-stone-500 hover:text-stone-200 hover:bg-stone-900'
                              }`}
                >
                  {icon && (
                    <span className={active ? 'text-stone-950' : 'text-stone-600'}>
                      {icon}
                    </span>
                  )}
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Divisor */}
          <div className="w-px h-5 bg-stone-800 mx-1" />

          {/* Carrinho */}
          <Link
            to="/carrinho"
            className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium
                        transition-all duration-200 group
                        ${pathname === '/carrinho'
                          ? 'bg-stone-800 text-stone-100'
                          : 'text-stone-500 hover:text-stone-200 hover:bg-stone-900'
                        }`}
          >
            <span className="group-hover:text-amber-400 transition-colors duration-150">
              <CartIcon />
            </span>

            {totalItens > 0 && (
              <>
                <span className="text-stone-300 group-hover:text-stone-100 transition-colors duration-150 hidden sm:inline">
                  Carrinho
                </span>
                <span className="bg-amber-400 text-stone-950 text-[10px] font-medium
                                 min-w-[18px] h-[18px] px-1 flex items-center justify-center
                                 rounded-full tabular-nums">
                  {totalItens > 99 ? '99+' : totalItens}
                </span>
              </>
            )}

            {totalItens === 0 && (
              <span className="hidden sm:inline">Carrinho</span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}