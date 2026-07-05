import { Component, type ReactNode } from "react";
import { routes } from "../routes";

type Props = { children: ReactNode; onError?: () => void };
type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="mx-auto max-w-[420px] px-6 pt-24 text-center">
          <div className="text-5xl opacity-40">🐇</div>
          <h2 className="mt-5 text-lg font-bold text-[var(--ink)]">出了点小问题</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">页面遇到了意外错误，试试刷新一下。</p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[16px] bg-[var(--pink)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--pink-2)]"
            >
              刷新页面
            </button>
            <a
              href={routes.home}
              className="text-sm font-semibold text-[#6d5c53] underline-offset-2 hover:underline"
            >
              回首页
            </a>
          </div>
          {this.state.error && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-xs text-[var(--muted)]">错误详情</summary>
              <pre className="mt-2 whitespace-pre-wrap break-all text-[11px] text-[var(--muted)]">{this.state.error.stack}</pre>
            </details>
          )}
        </main>
      );
    }

    return this.props.children;
  }
}
