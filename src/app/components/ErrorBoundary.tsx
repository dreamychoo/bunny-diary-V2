import { Component, type ReactNode } from "react";

type Props = { children: ReactNode; onError?: () => void };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="mx-auto max-w-[420px] px-6 pt-24 text-center">
          <div className="text-5xl opacity-40">🐇</div>
          <h2 className="mt-5 text-lg font-bold text-[var(--ink)]">出了点小问题</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">页面遇到了意外错误，试试刷新一下。</p>
          <button
            onClick={() => window.location.reload()}
            className="mx-auto mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-[16px] bg-[var(--pink)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--pink-2)]"
          >
            刷新页面
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
