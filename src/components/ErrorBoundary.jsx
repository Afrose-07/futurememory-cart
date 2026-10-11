import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetState = () => {
    try {
      localStorage.removeItem('fm_cart_guest');
      const authUser = localStorage.getItem('fm_user');
      if (authUser) {
        const u = JSON.parse(authUser);
        if (u?.email) {
          localStorage.removeItem(`fm_cart_${u.email.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`);
        }
      }
    } catch (e) {
      console.error(e);
    }
    window.location.href = '/home';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '40px 32px',
            maxWidth: '520px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
              Oops! Something unexpected happened
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px', lineHeight: '1.5' }}>
              We ran into a small glitch while loading this page. Don't worry, your account and orders are completely safe.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 24px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)'
                }}
              >
                Reload Page
              </button>

              <button
                onClick={this.handleResetState}
                style={{
                  background: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '12px 20px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Reset & Repair
              </button>
            </div>

            {this.state.error && (
              <details style={{ marginTop: '20px', textAlign: 'left', fontSize: '12px', color: '#dc2626' }}>
                <summary style={{ cursor: 'pointer', color: '#64748b' }}>Technical Details</summary>
                <pre style={{ whiteSpace: 'pre-wrap', marginTop: '8px', background: '#fef2f2', padding: '10px', borderRadius: '8px' }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
