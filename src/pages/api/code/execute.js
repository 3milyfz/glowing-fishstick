import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";

const execPromise = promisify(exec);

const getLanguageCommands = async () => ({
  c: "gcc -o temp temp.c && ./temp",
  cpp: "g++ -o temp temp.cpp && ./temp",
  java: "javac Main.java && java Main",
  python: `python3 temp.py`,
  javascript: "node temp.js",
  "c#": "mcs temp.cs && mono temp.exe",
  ruby: "ruby temp.rb",
  bash: "bash ./temp.sh",
  php: "php temp.php",
  perl: "perl temp.pl",
});

const fileExtensionMap = {
  c: "c",
  cpp: "cpp",
  java: "java",
  python: "py",
  javascript: "js",
  "c#": "cs",
  ruby: "rb",
  bash: "sh",
  php: "php",
  perl: "pl",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ error: "Method Not Allowed: Only POST requests are allowed" });
  }

  const { code, language, stdin } = req.body;

  const languageCommands = await getLanguageCommands();

  if (!code || !language || !languageCommands[language]) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const fileExtension = fileExtensionMap[language];
  const tempFileName =
    language === "java" ? "Main.java" : `temp.${fileExtension}`;
  const stdinFileName = "stdin.txt";

  try {
    console.log(`Preparing to write code to ${tempFileName}`);
    await fs.promises.writeFile(tempFileName, code);

    const writtenCode = await fs.promises.readFile(tempFileName, "utf8");
    console.log(`Written code to ${tempFileName}:\n${writtenCode}`);

    const fileExists = await fs.promises
      .stat(tempFileName)
      .then(() => true)
      .catch(() => false);
    console.log(`Temp file exists: ${fileExists}`);

    if (stdin) {
      console.log(`Writing stdin content to ${stdinFileName}`);
      await fs.promises.writeFile(stdinFileName, stdin);
      const stdinContent = await fs.promises.readFile(stdinFileName, "utf8");
      console.log(`Stdin content written:\n${stdinContent}`);
    }

    const command =
      `docker run --rm -v $(pwd):/code:ro -w /code --cpus="1" --memory="1g" --user root test-env bash -c "` +
      `mkdir ../runcode && ` +
      `cp ${tempFileName} ../runcode && ` +
      `${stdin ? `cp ${stdinFileName} ../runcode && ` : ""}` +
      `cd ../runcode && ` +
      `timeout 6s ${languageCommands[language]}${
        stdin ? " < stdin.txt" : ""
      }"`;

    // console.log(`Executing Docker command:\n${command}`);

    const { stdout, stderr } = await execPromise(command);

    // console.log(`Command executed successfully.`);
    // console.log(`stdout:\n${stdout}`);
    // console.log(`stderr:\n${stderr}`);

    // cleanup temporary files
    await fs.promises.unlink(tempFileName).catch(() => {});
    if (stdin) {
      await fs.promises.unlink(stdinFileName).catch(() => {});
    }

    res.status(200).json({ return: 0, stdout, stderr });
  } catch (error) {
    // console.error(`Caught error: ${error.message}`);
    // console.error(`Error details: ${JSON.stringify(error, null, 2)}`);

    const exitCode = typeof error.code === "number" ? error.code : 1;

    if (exitCode == 124) {
      return res.status(200).json({
        return: exitCode,
        stdout: "",
        stderr: "Execution Timed Out",
      })
    }

    // cleanup temporary files
    await fs.promises.unlink(tempFileName).catch(() => {});
    if (stdin) {
      await fs.promises.unlink(stdinFileName).catch(() => {});
    }

    // return the error response
    res.status(500).json({
      return: exitCode,
      stdout: "",
      stderr: `Error details: ${JSON.stringify(error, null, 2)}`,
    });
  }
}