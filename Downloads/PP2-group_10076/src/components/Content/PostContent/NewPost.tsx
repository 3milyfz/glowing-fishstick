import InputField from "@/components/util/InputField";
import { useState } from "react";

// A Form for making a new post
export default function NewPost({
  titleVal,
  descriptionVal,
  tagVal,
  submitFn,
}: {
  titleVal?: string;
  descriptionVal?: string;
  tagVal?: string[];
  submitFn: (
    t: string,
    d: string,
    tags: string[],
    successCallback: (successful: boolean) => void,
  ) => void;
}) {
  const [title, setTitle] = useState(titleVal || "");
  const [description, setDescription] = useState(descriptionVal || "");
  const [tags, setTags] = useState(tagVal || []);
  const [tagInput, setTagInput] = useState("");
  const [successful, setSuccessful] = useState(true);

  const handleAddTag = (e: React.KeyboardEvent<HTMLElement>) => {
    // If press enter, add new tag
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="flex flex-col w-[100%] md:w-[80%] items-center space-y-4 p-10">
      <InputField
        value={title}
        onChange={setTitle}
        placeholder="Post Title"
      ></InputField>
      <textarea
        placeholder="Post Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="h-80 w-[100%] p-4 border border-gray-300 rounded-md
         text-gray-800 placeholder-gray-400 bg-white
         dark:text-white dark:placeholder-gray-300 dark:bg-gray-800"
      ></textarea>
      {/* Tags Inside Input */}
      <div className="w-full p-2 border border-gray-300 rounded flex flex-wrap items-center gap-2 bg-white dark:bg-gray-800 dark:text-white">
        {tags.map((tag, index) => (
          <div
            key={index}
            className="flex items-center bg-blue-200 text-blue-800 px-3 py-1 rounded-full"
          >
            <span>{tag}</span>
            <button
              onClick={() => {
                setSuccessful(true);
                handleRemoveTag(index);
              }}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              &times;
            </button>
          </div>
        ))}
        <input
          type="text"
          placeholder="Add a tag and press Enter"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          className="flex-1 p-1 focus:outline-none text-black dark:bg-gray-800 dark:text-white"
        />
      </div>

      <button
        onClick={() => submitFn(title, description, tags, setSuccessful)}
        className="w-full bg-blue-500 text-white py-2 mt-4 rounded hover:bg-blue-600"
      >
        Submit Post
      </button>
      {!successful && (
        <p className="text-red-500">
          Failed to create post. Make sure Title and Description are not empty.
        </p>
      )}
    </div>
  );
}
