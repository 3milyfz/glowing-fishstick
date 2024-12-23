import LoginContextProvider from "@/components/auth/LoginContextProvider";
import NavBar from "@/components/Navigation/Navigation";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <LoginContextProvider>
        <NavBar></NavBar>

        {/* Background color */}
        <div className="min-h-screen bg-gray-100 dark:bg-gray-700">
          <Component {...pageProps} />
        </div>
      </LoginContextProvider>
    </>
  );
}
