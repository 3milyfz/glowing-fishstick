import { useLoginContext } from "@/components/auth/LoginContextProvider";
import InputField from "@/components/util/InputField";
import TwoOptionButton from "@/components/util/TwoOptionButton";
import { LANGUAGES } from "@/constants/constants";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import SaveTemplateButton from "@/components/util/SaveTemplateButton";
import CodeEditor from "@/components/code/CodeEditor";
import RunCodeButton from "@/components/util/RunCodeButton";

export default function TemplateView() {
  const router = useRouter();
  const { queryAPIWithNoAuth, queryAPIWithAuth, user, isDark } =
    useLoginContext();

  function TagBox({ tag, onRemove, removable = true }) {
    return (
      <div className="flex items-center bg-green-200 text-green-800 px-3 py-1 rounded-full">
        {tag}
        {removable && user?.username === authorUsername && (
          <button onClick={onRemove} className="ml-1 text-green-800 font-bold">
            ×
          </button>
        )}
      </div>
    );
  }

  const [isRunning, setIsRunning] = useState(false);
  const [templateID, setTemplateID] = useState(null);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [explanation, setExplanation] = useState("");
  const [language, setLanguage] = useState("");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [stdin, setStdin] = useState("");
  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");
  const [codeSelected, setCodeSelected] = useState(true);
  const [authorUsername, setAuthorUsername] = useState("");
  const [forkID, setForkID] = useState(null); // State to store forked ID

  useEffect(() => {
    const { templateID } = router.query;
    setTemplateID(templateID);
    if (templateID) {
      queryAPIWithNoAuth(`/template/search/${templateID}`, { method: "GET" })
        .then((response) => {
          if (response.ok) {
            response.json().then((data) => {
              setTitle(data.title || "");
              setCode(data.code || "");
              setExplanation(data.explanation || "");
              setLanguage(data.language.toLowerCase());
              setTags(data.tags || []);
              setAuthorUsername(data.authorUsername);
              setForkID(data.forkID || null); // Extract forkID
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching template details:", error);
        });
    }
  }, [router.query, queryAPIWithNoAuth]);

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

  const addTag = () => {
    if (newTag.trim().toLowerCase() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()]);
    }
    setNewTag("");
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const deleteTemplate = async () => {
    try {
      const response = await queryAPIWithAuth(
        `/template/delete/${templateID}`,
        {
          method: "DELETE",
        },
      );
      if (response.ok) {
        alert("Template deleted successfully.");
        router.push("/templates");
      } else {
        alert("Failed to delete template.");
        console.error("Delete error:", await response.text());
      }
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const forkTemplate = async () => {
    router.push({
      pathname: "/newtemplate",
      query: { templateID },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto space-y-4 p-10">
      <TwoOptionButton
        leftSelected={codeSelected}
        setLeftSelected={setCodeSelected}
        leftValue="Code"
        rightValue="Info"
      />
      <div className="flex space-x-4">
        {user?.username === authorUsername ? (
          <>
            <SaveTemplateButton
              title={title}
              code={code}
              explanation={explanation}
              language={language}
              tags={tags}
            />
            <button
              onClick={deleteTemplate}
              className="bg-red-600 p-2 rounded-lg text-white hover:bg-red-700"
            >
              Delete
            </button>
          </>
        ) : (
          <button
            onClick={forkTemplate}
            className="bg-blue-600 p-2 rounded-lg text-white hover:bg-blue-700"
          >
            Fork Template
          </button>
        )}
      </div>
      {codeSelected ? (
        <div className="w-full flex flex-col items-center space-y-4">
          <h1
            className="text-xl font-bold text-center text-gray-800 dark:text-white"
            onClick={() => setCodeSelected(false)}
          >
            #{templateID} - {title || "Code Template"}
          </h1>
          <div className="flex flex-wrap gap-2 mb-4">
            {forkID && (
              <TagBox tag={`forked from @${forkID}`} removable={false} />
            )}
            {tags.map((tag, idx) => (
              <TagBox
                key={idx}
                tag={tag}
                onRemove={() => removeTag(tag)}
                removable={true}
              />
            ))}
            {user?.username === authorUsername && (
              <div className="flex items-center">
                <input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTag()}
                  placeholder="Add tag"
                  className="px-2 py-1 text-sm rounded-md bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none"
                />
                <button
                  onClick={addTag}
                  className="ml-2 bg-blue-500 text-white px-2 py-1 rounded-lg"
                >
                  +
                </button>
              </div>
            )}
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="p-2 rounded-lg text-black dark:text-white bg-gray-300 dark:bg-gray-800 w-full max-w-xs"
          >
            {Object.keys(LANGUAGES).map((lang) => (
              <option key={lang} value={lang}>
                {LANGUAGES[lang]}
              </option>
            ))}
          </select>
          <CodeEditor
            code={code}
            setCode={setCode}
            language={language}
            isDark={isDark}
          />
          <RunCodeButton isRunning={isRunning} onClick={executeCode} />
          <div className="w-full flex flex-col items-center space-y-2">
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Input (STDIN)"
              className="h-20 w-full p-4 border border-gray-300 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
            />
            <textarea
              readOnly
              value={stdout}
              placeholder="Output (STDOUT)"
              className="h-20 w-full p-4 border border-gray-300 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
            />
            <textarea
              readOnly
              value={stderr}
              placeholder="Errors (STDERR)"
              className="h-20 w-full p-4 border border-gray-300 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
            />
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center space-y-4">
          <InputField value={title} onChange={setTitle} placeholder="Title" />
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Description"
            className="h-80 w-full p-4 border border-gray-300 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
          />
        </div>
      )}
    </div>
  );
}
