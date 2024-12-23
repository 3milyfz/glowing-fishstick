import Link from "next/link";
import { useLoginContext } from "../auth/LoginContextProvider";
import { PostFormat } from "@/constants/constants";
import TagBox from "@/components/util/TagBox";

// Small box to hold post information.
export default function SmallPostBox({
  post,
  maxChars,
}: {
  post: PostFormat;
  maxChars?: number;
}) {
  const {
    title,
    description,
    creationTime,
    authorUsername,
    upvotes,
    downvotes,
    comment_counts,
    postID,
    tags,
    isHidden,
  } = post;

  return (
    <Link
      href={`/post/${postID}`}
      className="flex flex-col items-left dark:text-white text-black border-2 border-solid border-black dark:border-white p-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
    >
      <div className="w-[100%] flex items-left">
        <h1
          className={
            "text-xl font-extrabold" + (!!isHidden ? " text-red-400" : "")
          }
        >
          {title}
          {!!isHidden ? " (Hidden)" : ""}
        </h1>
        <div className="flex-1"></div>
        <p>{creationTime}</p>
      </div>
      <p className="text-xs">@{authorUsername}</p>
      <hr className="dark:border-white border-black"></hr>
      <p className="mt-2">
        {!maxChars || maxChars >= description.length
          ? description
          : description.slice(0, maxChars || -1) + "..."}
      </p>
      <br></br>
      <div className="flex-1"></div>
      <div className="flex items-center gap-2 my-2">
        {tags.map((x, idx) => (
          <TagBox val={x} key={idx}></TagBox>
        ))}
      </div>
      <p className="text-xs">{`${upvotes} Upvotes, ${downvotes} Downvotes, ${comment_counts} Comments`}</p>
    </Link>
  );
}
