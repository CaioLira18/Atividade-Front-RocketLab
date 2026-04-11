import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const { pathname } = useLocation()

  const links = [
    { to: '/', label: 'Catálogo' },
    { to: '/produtos/novo', label: '+ Novo Produto' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-stone-950 border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-400 rounded-sm flex items-center justify-center">
            <span className="text-stone-950 font-black text-sm">E</span>
          </div>
          <span className="text-white font-semibold tracking-tight text-lg">
            ECommerce <span className="text-amber-400">Manager</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                pathname === to
                  ? 'bg-amber-400 text-stone-950'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}