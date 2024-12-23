import InputField from "@/components/util/InputField";
import { useLoginContext } from "@/components/auth/LoginContextProvider";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Login() {
  const {
    setAccessTokenValid,
    setRefreshTokenValid,
    queryAPIWithNoAuth,
    user,
  } = useLoginContext();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showError, setShowError] = useState(false);
  const router = useRouter();

  if (!!user) {
    router.push("/");
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowError(false);

    const response = await queryAPIWithNoAuth("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    if (response.ok) {
      const data = (await response.json()) as {
        accessToken: string;
        refreshToken: string;
      };
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      setAccessTokenValid(true);
      setRefreshTokenValid(true);
      router.push("/profile"); // redirect to home if login successful
    } else {
      setShowError(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form
        onSubmit={handleLogin}
        className="flex flex-col w-[90%] md:w-[70%] lg:w-[50%] items-center space-y-4 p-10 bg-white dark:bg-gray-500 rounded-lg shadow-md"
      >
        <InputField
          value={username}
          onChange={setUsername}
          placeholder="Username"
          required={true}
        ></InputField>
        <InputField
          value={password}
          onChange={setPassword}
          placeholder="Password"
          required={true}
          type="password"
        ></InputField>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
        >
          Log In
        </button>
        <Link
          href="/signup"
          className="text-black dark:text-white hover:text-gray-400 dark:hover-text-gray-600"
        >
          Sign Up
        </Link>
        {showError && <h1 className="text-red-500">Error Logging In</h1>}
      </form>
    </div>
  );
}
