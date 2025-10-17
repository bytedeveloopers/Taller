import type { AppProps } from "next/app";

// usa el que ya tienes:
import "../app/globals.css";

// CSS del técnico (este sí existe en src/styles/)
import "@/styles/tecnico-dashboard.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
