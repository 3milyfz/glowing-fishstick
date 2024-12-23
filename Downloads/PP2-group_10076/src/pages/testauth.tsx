import RequireAuth from "@/components/auth/RedirectIfNoAuth";
import LoginContextProvider, {
  LoginContext,
  useLoginContext,
} from "@/components/auth/LoginContextProvider";
import { useContext } from "react";

export default function TestAuth() {
  return (
    <RequireAuth>
      <TestComponent></TestComponent>
    </RequireAuth>
  );
}

// TEST:
// - go to page(should redirect to /login)
// - run in console: localStorage.setItem('accessToken', 'hello'); localStorage.setItem('refreshToken', 'bye');
// - go back to /testauth
// - try clicking the button
// - try refreshing the page, should redirect to login now
const TestComponent = () => {
  const { queryAPIWithAuth } = useLoginContext();

  return (
    <>
      <p>Hello!</p>
      <button
        onClick={() => queryAPIWithAuth("auth/makeadmin", { method: "PUT" })}
      >
        CLICK ME PLEASE HEHEHE
      </button>
    </>
  );
};
