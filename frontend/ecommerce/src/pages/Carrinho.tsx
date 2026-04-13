import { useCart } from '../components/CartContext'
import { Link } from 'react-router-dom'

export default function Carrinho() {
  const { cart, removeFromCart, clearCart } = useCart()

  // Função auxiliar para extrair o preço de forma segura
  const getPreco = (item: any) => item.preco_medio || item.preco || item.preco_BRL || 0

  const totalGeral = cart.reduce((acc, item) => {
    return acc + (getPreco(item) * item.quantidade)
  }, 0)

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">O seu carrinho está vazio</h2>
        <Link to="/" className="inline-block bg-amber-400 text-stone-950 px-6 py-2 rounded-lg font-bold hover:bg-amber-300 transition-colors">
          Voltar ao Catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-3xl font-bold text-white">Carrinho</h1>
        <button onClick={clearCart} className="text-red-400 text-sm hover:underline">Limpar tudo</button>
      </div>

      <div className="space-y-4">
        {cart.map(item => {
          const precoUnitario = getPreco(item)
          return (
            <div key={item.id_produto} className="bg-stone-900 border border-stone-800 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-stone-800 rounded-lg flex items-center justify-center text-stone-600">
                  {item.imagem_url ? (
                    <img
                      src={item.imagem_url}
                      alt={item.nome_produto}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">📦</span>
                  )}
                </div>
                <div>
                  <h3 className="text-white font-medium">{item.nome_produto}</h3>
                  <p className="text-stone-500 text-sm">Qtd: {item.quantidade}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <span className="text-amber-400 font-bold text-lg">
                  {(precoUnitario * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                <button onClick={() => removeFromCart(item.id_produto)} className="text-stone-500 hover:text-red-400 transition-colors">
                  Remover
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-10 p-6 bg-stone-900 border border-stone-800 rounded-2xl flex justify-between items-center">
        <div>
          <p className="text-stone-500 text-sm uppercase tracking-widest">Total do Pedido</p>
          <p className="text-3xl font-black text-white">{totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
        <button className="px-8 py-4 bg-amber-400 text-stone-950 font-bold rounded-xl hover:bg-amber-300 transition-all shadow-lg shadow-amber-400/10">
          Finalizar Venda
        </button>
      </div>
    </div>
  )
}