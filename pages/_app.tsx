import "../styles/globals.scss";

import { AuthContextProvider } from "@elrond-giants/erd-react-hooks";
import { NetworkEnv } from "@elrond-giants/erdjs-auth/dist/types";
import { DefaultSeo } from "next-seo";
import { Poppins } from "next/font/google";
import Head from "next/head";
import { Provider as ReduxProvider } from "react-redux";

import Notifications from "../components/Notifications";
import { network } from "../config";
import store from "../redux/store";

const poppinsFont = Poppins({
  display: "swap",
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});

import type { AppProps } from "next/app";
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      <DefaultSeo
        titleTemplate="%s | Coindrip"
        defaultTitle="Coindrip"
        description="The token streaming protocol that facilitates web3 real-time payments, serving the needs of DAOs and businesses for tasks such as vesting, payroll, airdrops, and more."
        openGraph={{
          images: [
            {
              url: "https://devnet-v2.coindrip.finance/og-image.png",
              width: 1200,
              height: 734.42,
              type: "image/png",
            },
          ],
          siteName: "Coindrip",
        }}
        twitter={{
          handle: "@CoinDripHQ",
          cardType: "summary_large_image",
        }}
      />
      <ReduxProvider store={store}>
        <AuthContextProvider env={network.id as NetworkEnv} projectId={process.env.NEXT_PUBLIC_WALLET_CONNECT_ID}>
          <div className={poppinsFont.className}>
            <Component {...pageProps} />
            <Notifications />
          </div>
        </AuthContextProvider>
      </ReduxProvider>
    </>
  );
}

export default MyApp;
