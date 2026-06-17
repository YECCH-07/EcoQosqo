import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('EcoQosqo Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', background: '#fff7fa', fontFamily: 'Inter, system-ui, sans-serif',
          padding: 40, textAlign: 'center',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 18, background: '#4a001f',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, fontWeight: 800, color: '#e0c397', marginBottom: 24,
          }}>EQ</div>
          <h2 style={{ color: '#1a0a10', marginBottom: 8 }}>Algo salió mal</h2>
          <p style={{ color: '#8a6d78', maxWidth: 400, marginBottom: 24 }}>
            Ocurrió un error inesperado. Intente recargar la página.
          </p>
          <button
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{
              padding: '10px 24px', borderRadius: 8, border: 'none',
              background: '#4a001f', color: '#fff', cursor: 'pointer',
              fontSize: 14, fontWeight: 600,
            }}
          >
            Recargar aplicación
          </button>
          {this.state.error && (
            <details style={{ marginTop: 24, color: '#8a6d78', fontSize: 12, maxWidth: 500, textAlign: 'left' }}>
              <summary>Detalles técnicos</summary>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
