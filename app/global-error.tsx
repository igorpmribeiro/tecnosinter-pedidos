"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          padding: "48px 24px",
          textAlign: "center",
          color: "#0f172a",
          background: "#f8fafc",
        }}
      >
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <h1
            style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.01em" }}
          >
            Ocorreu um erro inesperado
          </h1>
          <p style={{ marginTop: 8, color: "#475569", fontSize: 14 }}>
            Recarregue a página ou tente novamente em alguns segundos.
          </p>
          {error.digest && (
            <p
              style={{
                marginTop: 12,
                fontFamily: "ui-monospace, monospace",
                fontSize: 11,
                color: "#94a3b8",
              }}
            >
              ref: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 14,
              fontWeight: 500,
              color: "#f8fafc",
              background: "#0f172a",
              border: "none",
              cursor: "pointer",
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
