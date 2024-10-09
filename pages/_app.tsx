import { ZkLoginSessionProvider } from "lib/zklogin/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import Providers from "../providers";
import Head from "next/head";

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ZkLoginSessionProvider>
        <Providers>
        <Head>
				<meta charSet="utf-8" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
				<meta
				name="viewport"
				content="width=device-width,initial-scale=1 viewport-fit=cover"
				/>
				<link rel="mask-icon" href="/images/swall.png" color="#FFFFFF" />
				<link rel="shortcut icon" href="/favicon.ico" />
				<meta name="theme-color" content="#ffffff" />
				<meta name="description" content="User controlled social netowrk" />
				<meta name="keywords" content="Keywords" />
				<title>Swall</title>

				<link rel="manifest" href="/manifest.json" />
				<link
					href="/images/swall.png"
					rel="icon"
					type="image/png"
					sizes="16x16"
				/>
				<link
				href="/images/swall.png"
				rel="icon"
				type="image/png"
				sizes="32x32"
				/>
				<link rel="apple-touch-icon" href="/apple-icon.png"></link>
        	</Head>
          <Component {...pageProps} />
        </Providers>
      </ZkLoginSessionProvider>
    </QueryClientProvider>
  );
}
