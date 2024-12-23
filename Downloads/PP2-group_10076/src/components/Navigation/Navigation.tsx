import { useState } from "react";
import { PAGES } from "@/constants/constants";
import Link from "next/link";
import { useLoginContext } from "../auth/LoginContextProvider";
import { useRouter } from "next/router";
import ProfilePictureCircle from "../profile/ProfileCircle";

export default function NavBar() {
  const [displayList, setDisplayList] = useState(false);
  const { user, isDark, setDark } = useLoginContext();

  const router = useRouter();

  // Prepare links, adding Profile based on user status
  const links = PAGES.slice();
  if (user) {
    links.push({ name: "Profile", link: "/profile" });
  }

  return (
    <nav
      id="navbar"
      className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 flex-wrap"
    >
      {/* Logo */}
      <Link
        href="/"
        className="hidden md:block text-gray-500 dark:text-white font-bold text-xl"
      >
        Scriptorium
      </Link>
      <Link
        href="/"
        className="md:hidden text-gray-500 dark:text-white font-bold text-xl"
      >
        Home
      </Link>

      {/* Set Theme */}
      <button
        onClick={() => setDark(!isDark)}
        className="bg-gray-600 hover:bg-gray-500 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-black rounded-lg m-4 p-2 focus:outline-none"
      >
        {isDark ? "Light" : "Dark"}
      </button>

      {/* Spacing */}
      <div className="flex-1"></div>

      {/* Create New Post */}
      {!!user && (
        <Link
          href="/newpost"
          className="bg-gray-600 hover:bg-gray-500 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-black rounded-lg p-2 focus:outline-none"
        >
          New Post
        </Link>
      )}

      {/* Create New Template */}
      {!!user ? (
        <Link
          href="/newtemplate"
          className="hidden md:block bg-gray-600 hover:bg-gray-500 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-black rounded-lg m-4 p-2 focus:outline-none"
        >
          New Template
        </Link>
      ) : (
        <Link
          href="/scripteditor"
          className="hidden md:block bg-gray-600 hover:bg-gray-500 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-black rounded-lg m-4 p-2 focus:outline-none"
        >
          Script Editor
        </Link>
      )}

      {/* Nav links */}
      <div id="nav-links" className="hidden md:flex items-center space-x-4">
        <NavbarLinks data={links}></NavbarLinks>
        {!!user ? (
          router.asPath !== "/profile" && (
            <Link href="/profile">
              <ProfilePictureCircle
                img={user.avatar}
                size="small"
                border={true}
              ></ProfilePictureCircle>
            </Link>
          )
        ) : (
          <Link
            href="/login"
            className={`${router.asPath === "/login" ? "font-bold text-gray-700 dark:text-white" : "text-gray-500 dark:text-white"}`}
          >
            Login
          </Link>
        )}
      </div>

      {/* Menu Icon */}
      {displayList && (
        <div
          id="nav-links-sm"
          className="flex flex-col space-y-2 bg-white dark:bg-gray-800 pr-5 text-left md:hidden"
        >
          <NavbarLinks data={links}></NavbarLinks>
          {!user && (
            <Link
              href="/login"
              className={`${router.asPath === "/login" ? "font-bold text-gray-700 dark:text-white" : "text-gray-500 dark:text-white"}`}
            >
              Login
            </Link>
          )}
        </div>
      )}
      <button
        id="hamburger-menu"
        className="block md:hidden text-gray-500 dark:text-white focus:outline-none"
        onClick={() => setDisplayList(!displayList)}
      >
        {displayList ? (
          <svg
            className="w-6 h-6"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4 4 L16 16 M16 4 L4 16" strokeWidth="2" />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        )}
      </button>
    </nav>
  );
}

interface NavbarLink {
  name: string;
  link: string;
}

function NavbarLinks({ data }: { data: NavbarLink[] }) {
  const router = useRouter();
  return (
    <>
      {data.map((x, idx) => {
        const { name, link } = x;
        const isActive = router.asPath === link;
        return (
          <Link
            href={link}
            key={idx}
            className={`${isActive ? "font-bold text-gray-700 dark:text-white" : "text-gray-500 dark:text-white"}`}
          >
            {name}
          </Link>
        );
      })}
    </>
  );
}
