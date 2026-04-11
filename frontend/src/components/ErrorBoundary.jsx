import React from 'react';

/**
 * Top-level error boundary. Catches render errors so one broken component
 * (e.g. react-pdf choking on a malformed file) doesn't blank the whole app.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // In prod you'd ship this to Sentry. For now, console is fine.
    console.error('ErrorBoundary caught:', error, info?.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div
          role="alert"
          style={{
            padding: '2rem',
            maxWidth: 640,
            margin: '4rem auto',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <h1 style={{ marginTop: 0 }}>Something went wrong</h1>
          <p>The page hit an unexpected error. You can try again, or reload.</p>
          <pre
            style={{
              background: '#f6f6f6',
              padding: '1rem',
              overflowX: 'auto',
              fontSize: 12,
            }}
          >
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <button type="button" onClick={this.handleReset} style={{ marginRight: 8 }}>
            Try again
          </button>
          <button type="button" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
