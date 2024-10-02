import { ZkLoginSessionProvider } from "lib/zklogin/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import Providers from "./providers";

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ZkLoginSessionProvider>
        <Providers>
          <Component {...pageProps} />
        </Providers>
      </ZkLoginSessionProvider>
    </QueryClientProvider>
  );
}
