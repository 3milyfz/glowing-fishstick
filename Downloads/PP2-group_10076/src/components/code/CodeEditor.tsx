import React, { useEffect } from "react";
import MonacoEditor, { useMonaco } from "@monaco-editor/react";

interface CodeEditorProps {
  code: string;
  setCode: (value: string) => void;
  language: string;
  isDark: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  setCode,
  language,
  isDark,
}) => {
  const monaco = useMonaco();

  // Map language codes to Monaco's supported languages
  const languageMap: { [key: string]: string } = {
    c: "c",
    cpp: "cpp",
    java: "java",
    python: "python",
    javascript: "javascript",
    cs: "csharp",
    ruby: "ruby",
    bash: "shell",
    perl: "perl", // Added Perl
    php: "php",
  };

  // Remove TypeScript-specific setup
  useEffect(() => {
    if (monaco && language === "perl") {
      // Add basic Perl syntax highlighting if necessary
      if (!monaco.languages.getLanguages().some(lang => lang.id === "perl")) {
        monaco.languages.register({ id: "perl" });

        monaco.languages.setMonarchTokensProvider("perl", {
          tokenizer: {
            root: [
              [/#[^\n]*/, "comment"], // Comments
              [/".*?"/, "string"], // Double-quoted strings
              [/'[^']*'/, "string"], // Single-quoted strings
              [/\b(print|my|sub|if|else|while|for|foreach|last|next|redo|use|require|package|return|eval|do)\b/, "keyword"], // Keywords
              [/\$\w+/, "variable"], // Variables
              [/[{}()\[\]]/, "@brackets"], // Brackets
              [/\d+/, "number"], // Numbers
            ],
          },
        });
      }
    }
  }, [monaco, language]);

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <MonacoEditor
        height="100%"
        width="100%"
        language={languageMap[language]}
        value={code}
        onChange={(value: string | undefined) => setCode(value || "")}
        theme={isDark ? "vs-dark" : "vs-light"}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;