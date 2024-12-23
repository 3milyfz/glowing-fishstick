import { useLoginContext } from "@/components/auth/LoginContextProvider";
import Link from "next/link";

export default function Home() {
  const { user } = useLoginContext();
  const isLoggedIn = !!user;

  return (
    <div className="flex flex-col items-center min-h-screen gap-2">
      <br></br>
      <br></br>
      <p className="hidden md:block text-black dark:text-white mt-8">Welcome To</p>
      <h1 className="hidden md:block md:text-6xl text-black dark:text-white font-bold mb-10">
        Scriptorium
      </h1>
      {!isLoggedIn && (
        <>
          <MiniHeader text="Get Started" />
          <LinkButton href="/signup" text="Sign Up" />
          <LinkButton href="/login" text="Login" />
        </>
      )}
      <MiniHeader text="Run your code!" />
      {!isLoggedIn ? (
        <LinkButton href="/scripteditor" text="Edit A Script" />
      ) : (
        <LinkButton href="/newtemplate" text="New Code Template" />
      )}
      <LinkButton href="/templates" text="See All Templates" />
      <MiniHeader text="Post about your progress!" />
      {isLoggedIn && <LinkButton href="/newpost" text="New Post" />}
      <LinkButton href="/posts" text="See All Posts" />
    </div>
  );
}

const LinkButton = ({ href, text }: { href: string; text: string }) => {
  return (
    <Link
      href={href}
      className="p-4 bg-gray-200 w-[100%] md:w-[50%] md:rounded-md dark:bg-gray-800 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
    >
      {text}
    </Link>
  );
};

const MiniHeader = ({ text }: { text: string }) => {
  return (
    <>
      <p className="w-[100%] md:w-[50%] text-black dark:text-white mt-4">{text}</p>
      <hr className="border-black dark:border-white border-solid w-[100%] md:w-[50%]"></hr>
    </>
  );
};
