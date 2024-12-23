import { useLoginContext } from "@/components/auth/LoginContextProvider";
import CodeEditor from "@/components/code/CodeEditor";
import { LANGUAGES } from "@/constants/constants";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import RunCodeButton from "@/components/util/RunCodeButton";

export default function ScriptEditor() {
  const [isRunning, setIsRunning] = useState(false);
  const [code, setCode] = useState("");
  const [stdin, setStdin] = useState("");
  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");
  const [language, setLanguage] = useState<keyof typeof LANGUAGES>("c");
  const { user, queryAPIWithNoAuth } = useLoginContext();
  const router = useRouter();

  // Redirect logged-in users to /newtemplate
  useEffect(() => {
    if (user) {
      router.push("/newtemplate");
    }
  }, [user, router]);

  const executeCode = async () => {
    setStdout("");
    setStderr("");
    setIsRunning(true); // Disable the button
    try {
      const response = await fetch("/api/code/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, language, stdin }),
      });

      const result = await response.json();
      if (response.ok) {
        setStdout(result.stdout || "");
        setStderr(result.stderr || "");
      } else {
        setStderr(result.stderr || "Failed to execute code.");
      }
    } catch (error) {
      console.error("Execution error:", error);
      setStderr("An unexpected error occurred.");
    } finally {
      setIsRunning(false); // Re-enable the button
    }
  };

  return (
    <div className="h-full flex flex-col items-center overflow-auto">
      {!user ? (
        <div className="flex flex-col w-full md:w-[80%] items-center space-y-4 p-10">
          <select
            value={language}
            onChange={(e) =>
              setLanguage(e.target.value as keyof typeof LANGUAGES)
            }
            className="p-2 rounded-lg text-black dark:text-white bg-gray-300 dark:bg-gray-800"
          >
            {Object.keys(LANGUAGES).map((x, idx) => (
              <option value={x} key={idx}>
                {LANGUAGES[x as keyof typeof LANGUAGES]}
              </option>
            ))}
          </select>
          <CodeInterface
            code={code}
            language={language}
            setCode={setCode}
            stdin={stdin}
            stdout={stdout}
            stderr={stderr}
            setStdin={setStdin}
            runFn={executeCode}
            isRunning={isRunning}
          />
        </div>
      ) : (
        <Link href="/newtemplate" className="text-xl m-4">
          Create New Template
        </Link>
      )}
    </div>
  );
}

// Interface to edit/view/run the code
function CodeInterface({
  code,
  language,
  setCode,
  stdin,
  stdout,
  setStdin,
  stderr,
  runFn,
  isRunning,
}: {
  code: string;
  language: keyof typeof LANGUAGES;
  setCode: (c: string) => void;
  stdin: string;
  setStdin: (s: string) => void;
  stdout: string;
  stderr: string;
  runFn: () => void;
  isRunning: boolean;
}) {
  const { isDark } = useLoginContext();

  return (
    <>
      <CodeEditor
        code={code}
        setCode={setCode}
        language={language}
        isDark={isDark}
      />
      <div className="flex justify-center items-center gap-4 w-full">
        <RunCodeButton isRunning={isRunning} onClick={runFn} />
      </div>
      <textarea
        placeholder="STDIN"
        value={stdin}
        onChange={(e) => setStdin(e.target.value)}
        className="h-20 w-full p-4 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 bg-white dark:text-white dark:placeholder-gray-300 dark:bg-gray-800"
      />
      <textarea
        readOnly
        placeholder="STDOUT"
        value={stdout}
        className="h-20 w-full p-4 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 bg-white dark:text-white dark:placeholder-gray-300 dark:bg-gray-800"
      />
      <textarea
        readOnly
        placeholder="STDERR"
        value={stderr}
        className="h-20 w-full p-4 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 bg-white dark:text-white dark:placeholder-gray-300 dark:bg-gray-800"
      />
    </>
  );
}
