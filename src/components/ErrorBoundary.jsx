import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-700">
          <div className="font-bold mb-1">⚠ Render error — {this.props.label || "component"}</div>
          <div className="text-red-400 font-mono break-all">{this.state.error?.message}</div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 bg-red-100 hover:bg-red-200 px-2 py-1 rounded transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
