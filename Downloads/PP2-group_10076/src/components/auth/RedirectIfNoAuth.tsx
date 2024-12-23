import { useRouter } from "next/router";
import { useLoginContext } from "./LoginContextProvider";
import { ReactNode, useEffect } from "react";

// Wrap children with this if page requires auth
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { accessTokenValid, refreshTokenValid, user } = useLoginContext();
  const router = useRouter();

  useEffect(() => {
    // Redirect if both tokens invalid
    if (!accessTokenValid && !refreshTokenValid) {
      router.push("/login");
    }
  }, [accessTokenValid, refreshTokenValid]);

  return <>{user ? children : <LoadingPage></LoadingPage>}</>;
}

const LoadingPage = () => {
  // TODO refine this, low prio.
  return <></>;
};
