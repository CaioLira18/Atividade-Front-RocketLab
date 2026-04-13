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

const ImageIcon = () => (
  <svg className="w-7 h-7 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="block text-xs font-medium text-stone-500 uppercase tracking-widest mb-2">
    {children}
    {required && <span className="text-amber-400 ml-1">*</span>}
  </label>
)

const inputClass = `w-full bg-stone-900 border border-stone-800 text-stone-100 placeholder-stone-700
                   rounded-lg px-4 py-3 text-sm
                   focus:outline-none focus:border-amber-400/50 focus:bg-stone-800/60
                   transition-all duration-200`

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
      <div className="min-h-screen bg-[#0C0A08] pt-16 flex items-center justify-center">
        <div className="w-7 h-7 border border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0C0A08] pt-16">
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <Link
            to={isEdit && id ? `/produtos/${id}` : '/'}
            className="inline-flex items-center gap-1.5 text-stone-600 hover:text-amber-400
                       text-xs tracking-wide transition-colors duration-150"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </Link>

          <div className="mt-5 flex items-start justify-between">
            <div>
              <span className="text-amber-400 text-[10px] font-medium tracking-[0.18em] uppercase">
                {isEdit ? 'Editar produto' : 'Novo produto'}
              </span>
              <h1 className="mt-1.5 text-2xl font-medium text-stone-50 tracking-tight">
                {isEdit ? 'Atualizar informações' : 'Adicionar ao catálogo'}
              </h1>
            </div>
          </div>
        </div>

        {/* Linha divisória */}
        <div className="h-px bg-stone-900 mb-8" />

        <form onSubmit={handleSubmit} className="space-y-7">

          {/* Imagem */}
          <div>
            <FieldLabel>URL da imagem</FieldLabel>
            <div className="flex gap-3">
              {/* Preview */}
              <div className="w-20 h-20 shrink-0 rounded-xl bg-stone-900 border border-stone-800
                              overflow-hidden flex items-center justify-center">
                {form.imagem_url && imgPreviewOk ? (
                  <img
                    src={form.imagem_url}
                    alt="preview"
                    className="w-full h-full object-cover"
                    onError={() => setImgPreviewOk(false)}
                  />
                ) : (
                  <ImageIcon />
                )}
              </div>

              {/* Input */}
              <div className="flex-1 flex flex-col gap-1.5">
                <input
                  type="url"
                  value={form.imagem_url ?? ''}
                  onChange={e => {
                    set('imagem_url', e.target.value)
                    setImgPreviewOk(false)
                  }}
                  onBlur={() => { if (form.imagem_url) setImgPreviewOk(true) }}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className={inputClass}
                />
                <p className="text-stone-700 text-[11px]">
                  Cole a URL de uma imagem pública.
                </p>
              </div>
            </div>
          </div>

          {/* Nome */}
          <div>
            <FieldLabel required>Nome do produto</FieldLabel>
            <input
              type="text"
              value={form.nome_produto}
              onChange={e => set('nome_produto', e.target.value)}
              placeholder="Ex: Tênis Esportivo Premium Run 2.0"
              className={inputClass}
            />
          </div>

          {/* Categoria */}
          <div>
            <FieldLabel required>Categoria</FieldLabel>
            <select
              value={form.categoria_produto}
              onChange={e => set('categoria_produto', e.target.value)}
              className={`${inputClass} text-stone-400`}
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map(c => (
                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          {/* Medidas */}
          <div>
            <FieldLabel>Medidas e peso</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'peso_produto_gramas' as const, label: 'Peso (g)', placeholder: '300' },
                { key: 'comprimento_centimetros' as const, label: 'Comprimento (cm)', placeholder: '20' },
                { key: 'altura_centimetros' as const, label: 'Altura (cm)', placeholder: '10' },
                { key: 'largura_centimetros' as const, label: 'Largura (cm)', placeholder: '15' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-[11px] text-stone-700 mb-1.5">{label}</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={form[key] ?? ''}
                    onChange={e => set(key, e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder={placeholder}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Linha divisória */}
          <div className="h-px bg-stone-900" />

          {/* Erro */}
          {error && (
            <div className="flex items-start gap-3 bg-red-950/40 border border-red-900/50
                            text-red-400 text-sm px-4 py-3 rounded-xl">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3.5 bg-amber-400 text-stone-950 text-sm font-medium rounded-xl
                         hover:bg-amber-300 active:scale-[0.99]
                         disabled:opacity-40 disabled:cursor-not-allowed
                         transition-all duration-200 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                  </svg>
                  Salvando...
                </>
              ) : isEdit ? 'Salvar alterações' : 'Criar produto'}
            </button>
            <Link
              to={isEdit && id ? `/produtos/${id}` : '/'}
              className="px-6 py-3.5 bg-stone-900 border border-stone-800 text-stone-500
                         text-sm font-medium rounded-xl hover:border-stone-700 hover:text-stone-300
                         transition-all duration-200 text-center"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}