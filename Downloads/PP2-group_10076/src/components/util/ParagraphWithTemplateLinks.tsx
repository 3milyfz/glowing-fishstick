import Link from "next/link";
import { useState } from "react";

export default function ParagraphWithTemplateLinks({
  text,
  className,
  type,
  isEditing,
  onTextChange,
}: {
  text: string;
  className?: string;
  type: string;
  isEditing?: boolean;
  onTextChange: (text: string, type: string) => void;
}) {
  const regex = /@{(\d+)}/g;
  const parts = text.split(regex);

  const handleEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onTextChange(e.target.value, type);
  };

  return (
    <div className={className}>
      {isEditing ? (
        <textarea
          value={text}
          onChange={handleEdit}
          className="w-[100%] p-4 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 bg-white dark:text-white dark:placeholder-gray-300 dark:bg-gray-800"
          required
        />
      ) : (
        <p className="whitespace-pre-wrap">
          {parts.map((part, idx) => {
            return idx % 2 == 1 ? (
              <Link
                key={idx}
                href={`/template/${part}`}
                className="font-extrabold hover:text-gray-400"
              >
                @{part}
              </Link>
            ) : (
              part
            );
          })}
        </p>
      )}
    </div>
  );
}
