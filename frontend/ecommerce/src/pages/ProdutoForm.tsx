import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProduto, createProduto, updateProduto } from '../services/api'
import type { ProdutoUpdate } from '../types'

const categorias = [
  'perfumaria', 'automotivo', 'cama_mesa_banho', 'utilidades_domesticas',
  'relogios_presentes', 'cool_stuff', 'consoles_games', 'moveis_decoracao',
  'beleza_saude', 'fashion_calcados', 'informatica_acessorios', 'brinquedos',
  'pet_shop', 'esporte_lazer', 'ferramentas_jardim', 'moveis_sala',
  'malas_acessorios', 'casa_construcao', 'moveis_cozinha_jantar_jardim',
  'construcao_ferramentas', 'moveis_quarto', 'fashion_roupa_masculina', 'construcao_seguranca',
]

export default function ProdutoForm() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState<ProdutoUpdate>({
    nome_produto: '',
    categoria_produto: '',
    imagem_url: '',
    peso_produto_gramas: undefined,
    comprimento_centimetros: undefined,
    altura_centimetros: undefined,
    largura_centimetros: undefined,
  })
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [imgPreviewOk, setImgPreviewOk] = useState(false)

  useEffect(() => {
    if (!id) return
    getProduto(id).then(p => {
      setForm({
        nome_produto: p.nome_produto,
        categoria_produto: p.categoria_produto,
        imagem_url: p.imagem_url ?? '',
        peso_produto_gramas: p.peso_produto_gramas,
        comprimento_centimetros: p.comprimento_centimetros,
        altura_centimetros: p.altura_centimetros,
        largura_centimetros: p.largura_centimetros,
      })
      if (p.imagem_url) setImgPreviewOk(true)
    }).finally(() => setLoading(false))
  }, [id])

  const set = (key: keyof ProdutoUpdate, value: string | number | undefined) =>
    setForm(prev => ({ ...prev, [key]: value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome_produto || !form.categoria_produto) {
      setError('Nome e categoria são obrigatórios.')
      return
    }
    setSaving(true)
    setError('')
    try {
      if (isEdit && id) {
        await updateProduto(id, form)
        navigate(`/produtos/${id}`)
      } else {
        const novo = await createProduto(form)
        navigate(`/produtos/${novo.id_produto}`)
      }
    } catch {
      setError('Erro ao salvar produto. Verifique os dados e tente novamente.')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 pt-16 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-950 pt-16">
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <Link
            to={isEdit && id ? `/produtos/${id}` : '/'}
            className="text-stone-500 hover:text-amber-400 text-sm transition-colors"
          >
            ← Voltar
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-white">
            {isEdit ? 'Editar Produto' : 'Novo Produto'}
          </h1>
          <p className="mt-1 text-stone-500">
            {isEdit ? 'Atualize as informações do produto.' : 'Preencha os dados para adicionar ao catálogo.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Imagem URL + Preview */}
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">
              URL da imagem
            </label>
            <div className="flex gap-3">
              {/* Preview */}
              <div className="w-24 h-24 shrink-0 rounded-lg bg-stone-800 border border-stone-700 overflow-hidden flex items-center justify-center">
                {form.imagem_url && imgPreviewOk ? (
                  <img
                    src={form.imagem_url}
                    alt="preview"
                    className="w-full h-full object-cover"
                    onError={() => setImgPreviewOk(false)}
                  />
                ) : (
                  <svg className="w-8 h-8 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>

              {/* Input */}
              <div className="flex-1 flex flex-col gap-2">
                <input
                  type="url"
                  value={form.imagem_url ?? ''}
                  onChange={e => {
                    set('imagem_url', e.target.value)
                    setImgPreviewOk(false)
                  }}
                  onBlur={() => { if (form.imagem_url) setImgPreviewOk(true) }}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="w-full bg-stone-900 border border-stone-700 text-white placeholder-stone-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                />
                <p className="text-stone-600 text-xs">
                  Cole a URL de uma imagem. Se vazio, usará a imagem da categoria.
                </p>
              </div>
            </div>
          </div>

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">
              Nome do produto <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              value={form.nome_produto}
              onChange={e => set('nome_produto', e.target.value)}
              placeholder="Ex: Tênis Esportivo Premium"
              className="w-full bg-stone-900 border border-stone-700 text-white placeholder-stone-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">
              Categoria <span className="text-amber-400">*</span>
            </label>
            <select
              value={form.categoria_produto}
              onChange={e => set('categoria_produto', e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 text-stone-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition-colors"
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map(c => (
                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          {/* Medidas */}
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">Medidas e Peso</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'peso_produto_gramas' as const, label: 'Peso (g)', placeholder: '300' },
                { key: 'comprimento_centimetros' as const, label: 'Comprimento (cm)', placeholder: '20' },
                { key: 'altura_centimetros' as const, label: 'Altura (cm)', placeholder: '10' },
                { key: 'largura_centimetros' as const, label: 'Largura (cm)', placeholder: '15' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs text-stone-500 mb-1">{label}</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={form[key] ?? ''}
                    onChange={e => set(key, e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder={placeholder}
                    className="w-full bg-stone-900 border border-stone-700 text-white placeholder-stone-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Erro */}
          {error && (
            <div className="bg-red-950 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-amber-400 text-stone-950 font-semibold rounded-lg hover:bg-amber-300 transition-colors disabled:opacity-50"
            >
              {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar produto'}
            </button>
            <Link
              to={isEdit && id ? `/produtos/${id}` : '/'}
              className="px-6 py-3 bg-stone-900 border border-stone-700 text-stone-300 font-medium rounded-lg hover:border-stone-500 transition-colors text-center"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}