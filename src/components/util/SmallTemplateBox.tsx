import Link from "next/link";
import { TemplateFormat } from "@/constants/constants";
import { LANGUAGES } from "@/constants/constants";

// Small box to hold template information.
export default function SmallTemplateBox({
  template,
  maxChars,
}: {
  template: TemplateFormat;
  maxChars?: number;
}) {
  const {
    title,
    explanation,
    language,
    creationTime,
    author,
    id,
    tags,
    forkID,
  } = template;

  return (
    <Link
      href={`/template/${id}`}
      className="flex flex-col dark:text-white text-black border-2 border-solid border-black dark:border-white p-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
    >
      <div className="w-full flex items-start">
        <h1 className="text-xl font-extrabold">
          @{id}: {title}
        </h1>
        <div className="flex-1"></div>
        <p>{creationTime}</p>
      </div>
      <p className="text-xs">@{author?.username || "Unknown"}</p>
      <hr className="dark:border-white border-black"></hr>
      <p className="mt-2">
        {!maxChars || maxChars >= explanation.length
          ? explanation
          : explanation.slice(0, maxChars) + "..."}
      </p>
      <br />
      <div className="flex-1"></div>
      <div
        className="flex flex-wrap gap-2 my-2"
        style={{
          width: "100%",
          maxWidth: "100%", // Ensure tags don't overflow
        }}
      >
        {forkID && <TagBox val={`forked from @${forkID}`} removable={false} />}
        {tags.map((tag, idx) => (
          <TagBox val={tag} key={idx} />
        ))}
      </div>
      <p className="text-xs">{LANGUAGES[language as keyof typeof LANGUAGES]}</p>
    </Link>
  );
}

function TagBox({ val, removable }: { val: string; removable?: boolean }) {
  return (
    <div
      className={`inline-flex items-center bg-green-200 text-green-800 px-3 py-1 rounded-full`}
      style={{
        whiteSpace: "nowrap",
        maxWidth: "100%",
      }}
    >
      {val}
    </div>
  );
}