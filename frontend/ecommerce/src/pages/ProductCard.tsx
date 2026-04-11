import { Link } from 'react-router-dom'
import type { Produto } from '../types'

interface Props {
  produto: Produto
}

const categoryLabel: Record<string, string> = {
  perfumaria: 'Perfumaria',
  automotivo: 'Automotivo',
  cama_mesa_banho: 'Cama, Mesa e Banho',
  utilidades_domesticas: 'Utilidades Domésticas',
  relogios_presentes: 'Relógios e Presentes',
  cool_stuff: 'Cool Stuff',
  consoles_games: 'Consoles & Games',
  moveis_decoracao: 'Móveis e Decoração',
  beleza_saude: 'Beleza e Saúde',
  fashion_calcados: 'Fashion Calçados',
  informatica_acessorios: 'Informática',
  brinquedos: 'Brinquedos',
  pet_shop: 'Pet Shop',
  esporte_lazer: 'Esporte e Lazer',
  ferramentas_jardim: 'Ferramentas',
  moveis_sala: 'Móveis Sala',
  malas_acessorios: 'Malas e Acessórios',
  casa_construcao: 'Casa e Construção',
}

export default function ProductCard({ produto }: Props) {
  return (
    <Link
      to={`/produtos/${produto.id_produto}`}
      className="group block bg-stone-900 border border-stone-800 rounded-xl overflow-hidden hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-400/5 transition-all duration-300"
    >
      {/* Imagem */}
      <div className="relative h-48 bg-stone-800 overflow-hidden">
        {produto.link_imagem ? (
          <img
            src={produto.link_imagem}
            alt={produto.nome_produto}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-600">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-stone-950/80 backdrop-blur text-amber-400 text-xs font-medium rounded-md">
            {categoryLabel[produto.categoria_produto] ?? produto.categoria_produto}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-amber-400 transition-colors">
          {produto.nome_produto}
        </h3>
        <p className="mt-2 text-stone-500 text-xs">
          {produto.peso_produto_gramas ? `${produto.peso_produto_gramas}g` : '—'}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-stone-600 text-xs font-mono truncate max-w-[120px]">
            #{produto.id_produto.slice(0, 8)}
          </span>
          <span className="text-amber-400 text-xs font-medium group-hover:translate-x-1 transition-transform inline-block">
            Ver detalhes →
          </span>
        </div>
      </div>
    </Link>
  )
}