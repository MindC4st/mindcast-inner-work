import { Component, ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

// Last line of defence: a render error anywhere in the app shows a branded
// recovery screen instead of a white page.
class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[hsl(var(--ivory))] flex items-center justify-center px-6">
          <div className="max-w-sm text-center">
            <p className="text-primary text-xs tracking-[0.5em] font-body uppercase mb-3">Mindcast</p>
            <h1 className="font-display text-4xl tracking-wider text-[hsl(var(--navy))] mb-3">SOMETHING SNAPPED</h1>
            <p className="font-body text-sm text-[hsl(var(--navy-mid))] mb-6">
              That's static, not signal. A reload usually clears it — your journal and check-ins are safe.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[hsl(var(--navy))] text-[hsl(var(--ivory))] text-xs font-body tracking-widest uppercase rounded-sm hover:opacity-90 transition-opacity"
            >
              Reload Mindcast
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
