import { Component, type ReactNode } from 'react'

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        style={{
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          background: 'linear-gradient(160deg, #1a1a5e 0%, #0d2137 50%, #0a0a2e 100%)',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
          padding: 32,
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: 48 }} role="img" aria-label="Error">⚠️</span>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
          Algo salió mal
        </h1>
        <p style={{ fontSize: 14, opacity: 0.6, margin: 0 }}>
          Ha ocurrido un error inesperado. Pulsa el botón para recargar.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: 8,
            padding: '12px 32px',
            borderRadius: 16,
            border: 'none',
            background: 'linear-gradient(135deg, #63b3ed, #48bb78)',
            color: 'white',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Recargar
        </button>
      </div>
    )
  }
}
