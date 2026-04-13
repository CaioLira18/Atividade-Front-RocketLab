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

const BoxIcon = () => (
  <svg className="w-10 h-10 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
  </svg>
)

const HexCheck = () => (
  <svg className="w-4 h-4 text-amber-400" viewBox="0 0 16 16" fill="none">
    <path d="M8 1.5L14 5v6L8 14.5L2 11V5L8 1.5Z" stroke="currentColor" strokeWidth="1" fill="none" />
    <path d="M5.5 8L7 9.5L10.5 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function ProductCard({ produto }: Props) {
  return (
    <Link
      to={`/produtos/${produto.id_produto}`}
      className="group relative flex flex-col bg-stone-900 border border-stone-800 rounded-xl overflow-hidden
                 hover:border-amber-400/40 hover:shadow-[0_0_24px_rgba(245,158,11,0.07)]
                 transition-all duration-300"
    >
      {/* Imagem */}
      <div className="relative h-48 bg-stone-800 overflow-hidden flex-shrink-0">
        {produto.imagem_url ? (
          <img
            src={produto.imagem_url}
            alt={produto.nome_produto}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BoxIcon />
          </div>
        )}

        {/* Overlay escuro no hover */}
        <div className="absolute inset-0 bg-stone-950/0 group-hover:bg-stone-950/20 transition-colors duration-300" />

        {/* Badge categoria */}
        <div className="absolute top-3 left-3">
          <span className="flex items-center gap-1.5 px-2 py-1 bg-stone-950/80 backdrop-blur-sm
                           text-amber-400 text-[10px] font-medium tracking-wide rounded-md border border-amber-400/10">
            <HexCheck />
            {categoryLabel[produto.categoria_produto] ?? produto.categoria_produto.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex-1">
          <h3 className="text-stone-100 font-medium text-sm leading-snug line-clamp-2
                         group-hover:text-amber-400 transition-colors duration-200">
            {produto.nome_produto}
          </h3>
          {produto.peso_produto_gramas && (
            <p className="mt-1 text-stone-600 text-xs">
              {produto.peso_produto_gramas}g
            </p>
          )}
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-800">
          <span className="text-amber-400 text-sm font-medium tracking-tight font-mono">
            {produto.preco_medio
              ? produto.preco_medio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
              : <span className="text-stone-600">—</span>}
          </span>
          <span className="text-stone-600 text-xs group-hover:text-amber-400 group-hover:translate-x-0.5
                           transition-all duration-200 inline-flex items-center gap-1">
            Ver detalhes
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}