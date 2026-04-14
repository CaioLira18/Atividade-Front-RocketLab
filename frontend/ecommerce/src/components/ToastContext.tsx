import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
  productName?: string
  imageUrl?: string
}

interface ToastContextData {
  showToast: (message: string, options?: { type?: Toast['type']; productName?: string; imageUrl?: string }) => void
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData)

let counter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((
    message: string,
    options?: { type?: Toast['type']; productName?: string; imageUrl?: string }
  ) => {
    const id = ++counter
    const toast: Toast = {
      id,
      message,
      type: options?.type ?? 'success',
      productName: options?.productName,
      imageUrl: options?.imageUrl,
    }
    setToasts(prev => [...prev, toast])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        alignItems: 'flex-end',
        pointerEvents: 'none',
      }}
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  return (
    <div
      style={{
        pointerEvents: 'auto',
        animation: 'toastIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        background: '#1C1917',
        border: '0.5px solid #292524',
        borderRadius: '12px',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '280px',
        maxWidth: '360px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      }}
    >
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Ícone ou imagem do produto */}
      <div style={{
        width: 40, height: 40, borderRadius: 8,
        background: '#292524', border: '0.5px solid #44403C',
        overflow: 'hidden', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {toast.imageUrl ? (
          <img src={toast.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#57534E" strokeWidth={0.8}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
          </svg>
        )}
      </div>

      {/* Texto */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          {/* Dot de sucesso */}
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: toast.type === 'error' ? '#EF4444' : '#22C55E',
            flexShrink: 0,
          }} />
          <span style={{
            fontSize: 11, fontWeight: 500, letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: toast.type === 'error' ? '#EF4444' : '#22C55E',
          }}>
            {toast.type === 'error' ? 'Erro' : 'Adicionado'}
          </span>
        </div>
        {toast.productName && (
          <p style={{
            fontSize: 13, fontWeight: 500, color: '#D6D3D1',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {toast.productName}
          </p>
        )}
        <p style={{ fontSize: 12, color: '#57534E', marginTop: 1 }}>
          {toast.message}
        </p>
      </div>

      {/* Botão fechar */}
      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#44403C', padding: 4, flexShrink: 0,
          display: 'flex', alignItems: 'center',
        }}
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}