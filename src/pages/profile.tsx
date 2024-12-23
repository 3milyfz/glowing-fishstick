import { useLoginContext } from "@/components/auth/LoginContextProvider";
import ProfilePictureCircle from "@/components/profile/ProfileCircle";
import Link from "next/link";

// Basic profile info
export default function Profile() {
  const { setAccessTokenValid, setRefreshTokenValid, user, setUser } =
    useLoginContext();

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setAccessTokenValid(false);
    setRefreshTokenValid(false);
    setUser(undefined); // unnecessary, but probably best to explicitly wipe the user data.
  };

  return (
    <div className="flex flex-col gap-4 justify-center items-center">
      <div className="my-4"></div>
      {!user ? (
        <Link
          className="bg-green-400 text-white text-xl py-2 px-4 rounded-lg hover:bg-green-600"
          href="/login"
        >
          Login
        </Link>
      ) : (
        <>
          <ProfilePictureCircle
            img={user.avatar}
            size="large"
            border={true}
          ></ProfilePictureCircle>
          <Link
            href="/editprofile"
            className="text-black bg-gray-300 dark:text-white dark:bg-gray-500 hover:bg-gray-400 dark:hover:bg-gray-300 px-8 py-1 rounded-md"
          >
            edit
          </Link>
          {/* <h1 className="text-black dark:text-white">{user.username}</h1> */}
          <h1 className="text-black dark:text-white md:text-4xl text-xl">
            {user.firstName} {user.lastName}
          </h1>
          <h1 className="text-black dark:text-white">{user.email}</h1>
          {!!user.phone && (
            <h1 className="text-black dark:text-white">{user.phone}</h1>
          )}
          {user.isAdmin && (
            <h1 className="text-black dark:text-white">Admin User</h1>
          )}
          <button
            onClick={logout}
            className="bg-red-400 text-white text-xl py-2 px-4 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </>
      )}
      <div className="flex-1"></div>
    </div>
  );
}
