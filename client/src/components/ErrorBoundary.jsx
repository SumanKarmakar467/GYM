import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || "Unexpected application error." };
  }

  componentDidCatch() {
    // Intentionally left blank.
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="grid min-h-screen place-items-center bg-[#07090f] px-4 text-white">
          <div className="w-full max-w-xl rounded-2xl border border-white/15 bg-[#0f1522]/95 p-6 text-center shadow-2xl">
            <p className="text-lg font-semibold">Something went wrong.</p>
            <p className="mt-2 break-words text-sm text-zinc-300">{this.state.errorMessage}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-lg border border-orange-400/60 bg-orange-500/20 px-4 py-2 text-sm font-semibold text-orange-100 hover:bg-orange-500/30"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
