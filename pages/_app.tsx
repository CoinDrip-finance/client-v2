import '../styles/globals.scss';

import { AuthContextProvider } from '@elrond-giants/erd-react-hooks';
import { Poppins } from 'next/font/google';
import { Provider as ReduxProvider } from 'react-redux';

import Notifications from '../components/Notifications';
import store from '../redux/store';

const poppinsFont = Poppins({
  display: "swap",
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});

import type { AppProps } from "next/app";
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ReduxProvider store={store}>
      <AuthContextProvider
        env={process.env.NODE_ENV === "production" ? "mainnet" : "devnet"}
        projectId={process.env.NEXT_PUBLIC_WALLET_CONNECT_ID}
      >
        <div className={poppinsFont.className}>
          <Component {...pageProps} />
          <Notifications />
        </div>
      </AuthContextProvider>
    </ReduxProvider>
  );
}

export default MyApp;
