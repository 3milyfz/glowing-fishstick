import { useRouter } from "next/router";
import {
  createContext,
  ReactNode,
  useState,
  useEffect,
  useContext,
} from "react";

// Data about the user that we will need
interface UserType {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: number;
  isAdmin: boolean;
  id: number;
}

// Track if accessToken works, and if refreshToken works.
// If a request returns 401, accessToken does not work.
// If we try refresh and get 401, refreshToken does not work.
// User will contain user info that we will try to fetch if login works.
interface LoginContextType {
  accessTokenValid: boolean;
  refreshTokenValid: boolean;
  setAccessTokenValid: (valid: boolean) => void;
  setRefreshTokenValid: (valid: boolean) => void;
  queryAPIWithAuth: (path: string, init: RequestInit) => Promise<Response>;
  queryAPIWithNoAuth: (path: string, init: RequestInit) => Promise<Response>;
  user?: UserType; // User exists ==> fully logged in
  setUser: (u: UserType | undefined) => void;
  setDark: (dark: boolean) => void;
  isDark: boolean;
}

export const LoginContext = createContext<LoginContextType | undefined>(
  undefined,
);

export const useLoginContext = (): LoginContextType => {
  const context = useContext(LoginContext);

  if (!context) {
    throw new Error("LoginContext undefined");
  }
  return context;
};

// Wrap around any pages that require authorization. Use queryAPIWithAuth/WithNoAuth instead of fetch()
export default function LoginContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Valid just roughly means the token exists. It gets ACTUALLY validated by the server. TODO refactor
  const [accessTokenValid, setAccessTokenValid] = useState(true);
  const [refreshTokenValid, setRefreshTokenValid] = useState(true);
  const [user, setUser] = useState<undefined | UserType>(undefined);
  const [isDark, setIsDark] = useState(false);

  // runs a fetch() call against the api. Set access token invalid if response is 401.
  // eg. queryAPIWithAuth('/post/search', {...})
  const queryAPIWithAuth = async (path: string, init: RequestInit) => {
    const accessToken = localStorage.getItem("accessToken"); // Assume not null, we check elsewhere if it's missing
    init.headers = {
      ...init.headers,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };
    const fullUrl = `${window.location.origin}/api/${path}`;
    const response = await fetch(fullUrl, init);
    if (response.status === 401) {
      localStorage.removeItem("accessToken");
      setAccessTokenValid(false);
    }
    return response;
  };

  // Helper function to query API with no auth.
  // eg. queryAPIWithNoAuth('/post/search', {...})
  const queryAPIWithNoAuth = async (path: string, init: RequestInit) => {
    const fullUrl = `${window.location.origin}/api/${path}`;
    init.headers = { ...init.headers, "Content-Type": "application/json" };
    const response = fetch(fullUrl, init);
    return response;
  };

  // Load user info into user object
  const loadUserInfo = async () => {
    const response = await queryAPIWithAuth("/auth/profileInfo", {
      method: "POST",
    });
    if (response.ok) {
      const json = await response.json();
      setUser(json);
    }
  };

  // When loading page, set necessary things to False
  // TODO I think this is why profileInfo is getting called so much when the user is not authenticated. setters are used multiple times before request returns
  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      setUser(undefined);
      setAccessTokenValid(false);
    }
    if (!localStorage.getItem("refreshToken")) {
      setRefreshTokenValid(false);
    }
    if (localStorage.getItem("dark") !== null) {
      setIsDark(Boolean(localStorage.getItem("dark")));
    }
  }, []);

  // Set isDark in localStorage to save the setting
  useEffect(() => {
    if (!isDark) {
      localStorage.removeItem("dark");
    } else {
      localStorage.setItem("dark", isDark.toString());
    }
  }, [isDark]);

  // Try refresh if accessToken is not valid
  useEffect(() => {
    if (!accessTokenValid) {
      setUser(undefined);
      localStorage.removeItem("accessToken");
      if (refreshTokenValid) {
        tryRefreshInClient(
          () => {
            // Refresh failed, both tokens invalid
            localStorage.removeItem("refreshToken");
            setRefreshTokenValid(false);
          },
          () => {
            setAccessTokenValid(true);
          },
        );
      }
    }
    if (!user && accessTokenValid) {
      loadUserInfo();
    }
  }, [accessTokenValid]);

  return (
    <LoginContext.Provider
      value={{
        accessTokenValid,
        setAccessTokenValid,
        refreshTokenValid,
        setRefreshTokenValid,
        queryAPIWithAuth,
        queryAPIWithNoAuth,
        user,
        setUser,
        setDark: setIsDark,
        isDark,
      }}
    >
      <div className={isDark ? "dark" : ""}>{children}</div>
    </LoginContext.Provider>
  );
}

// Try to refresh and set access token in localStorage
const tryRefreshInClient = async (
  onInvalid: () => void,
  onValid: () => void,
) => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    onInvalid();
    return;
  }
  const response = await fetch(`${window.location.origin}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      refreshToken,
    }),
  });
  if (!response.ok) {
    // Call function on invalid
    onInvalid();
  } else {
    const { accessToken } = await response.json();
    if (!accessToken) {
      onInvalid();
    } else {
      localStorage.setItem("accessToken", accessToken);
      onValid();
    }
  }
};
