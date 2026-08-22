import { RefreshCw } from "lucide-react";
import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

// Real crash recovery: if any part of the app throws during render, this
// catches it and shows a recovery screen instead of a blank/broken app.
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log locally so Admin Mode can show recent crashes — no server involved.
    try {
      const log = JSON.parse(localStorage.getItem("crashLog") || "[]");
      log.unshift({
        message: error.message,
        stack: error.stack?.slice(0, 500),
        componentStack: info.componentStack?.slice(0, 500),
        time: new Date().toISOString(),
      });
      localStorage.setItem("crashLog", JSON.stringify(log.slice(0, 20)));
    } catch {
      /* ignore */
    }
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 bg-background text-center">
          <p className="text-4xl">⚠️</p>
          <h1 className="text-lg font-bold text-foreground">
            Kuch galat ho gaya
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            App mein ek error aayi. Aapki calculation history aur settings
            surakshit hain — bas app ko dobara load karein.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
          >
            <RefreshCw className="h-4 w-4" />
            Dobara Try Karein
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
