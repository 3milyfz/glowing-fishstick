import { useLoginContext } from "@/components/auth/LoginContextProvider";
import { useEffect, useState } from "react";

export interface PostInterface {
  contentID: number;
  title: string;
  description: string;
  creationTime: string;
  isHidden: boolean;
  authorUsername: string;
  authorID: number;
  upvotes: number;
  downvotes: number;
  reports: ReportInterface[];
  tags: string[];
  comment_counts: number;
  comments: { contentID: number }[];
}

export interface ReportInterface {
  reason: string;
  reportUsername: string;
}

// from comment/get
export interface CommentInterface {
  text: string;
  isHidden: boolean;
  upvotes: number;
  downvotes: number;
  creationTime: string;
  report_counts: number;
  reports: ReportInterface[];
  authorUsername: string;
}

export function PostInfo({ post }: { post: PostInterface }) {
  return (
    <div className="flex flex-col items-left pt-10 min-h-60">
      <div className="flex items-center dark:text-white text-black gap-4">
        <p>@{post.authorUsername}</p>
        <p>{post.creationTime}</p>
      </div>
      <h1 className="text-4xl dark:text-white text-black font-bold">
        {post.title}
      </h1>
      <hr className="dark:border-white border-black pb-4"></hr>
      <p className="dark:text-white">{post.description}</p>
      <div className="flex-1"></div>
      {/* TODO buttons */}
      <hr className="dark:border-white border-black"></hr>
    </div>
  );
}

export function CommentInfo({ contentID }: { contentID: string | number }) {
  const [fetching, setFetching] = useState(true);
  const [comment, setComment] = useState<CommentInterface | null>(null);
  const [voteStatus, setVoteStatus] = useState("none");
  const { queryAPIWithAuth, queryAPIWithNoAuth, user } = useLoginContext();
  const isLoggedIn = !!user;
  const apiCallFn = isLoggedIn ? queryAPIWithAuth : queryAPIWithNoAuth;

  const fetchComment = async () => {
    const response = await apiCallFn(`/post/comment/get/${contentID}`, {
      method: "GET",
    });

    // TODO add error checking, but typically, responses should be fine
    if (response.ok) {
      const data = await response.json();
      setComment(data as CommentInterface);
    }
  };

  const fetchAll = () => {
    setFetching(true);
    fetchComment();
    fetchVoteStatus();
    setFetching(false);
  };

  const fetchVoteStatus = async () => {
    if (!isLoggedIn) {
      return;
    }
    const response = await apiCallFn(`/post/comment/votestatus/${contentID}`, {
      method: "POST",
    });
    if (response.ok) {
      const { status } = await response.json();
      setVoteStatus(status);
    }
  };

  // 1 0 -1 for up remove down
  const dispatchVote = async (vote: number) => {
    await apiCallFn(`post/vote/${contentID}`, {
      method: "POST",
      body: JSON.stringify({ state: vote }),
    });
    // TODO error handling?
    fetchAll();
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <>
      {comment !== null && (
        <div className="flex flex-col items-start">
          <p className="text-sm">
            @{comment.authorUsername} {comment.creationTime}
          </p>
          <h1 className="text-black dark:text-white text-xl">{comment.text}</h1>
          <div className="flex flex-row items-center m-4">
            {voteStatus === "upvote" ? (
              <button
                className="bg-gray-200 p-2 rounded-md"
                onClick={() => dispatchVote(0)}
              >
                Cancel Upvote
              </button>
            ) : (
              <button
                className="bg-gray-200 p-2 rounded-md"
                onClick={() => dispatchVote(1)}
              >
                Upvote
              </button>
            )}
            {voteStatus === "downvote" ? (
              <button
                className="bg-gray-200 p-2 rounded-md"
                onClick={() => dispatchVote(0)}
              >
                Cancel Downvote
              </button>
            ) : (
              <button
                className="bg-gray-200 p-2 rounded-md"
                onClick={() => dispatchVote(-1)}
              >
                Downvote
              </button>
            )}
          </div>
          <div className="flex flex-row gap-2 min-h-10">
            <div className="mx-4 w-6 h-[100%] w-4 border-l dark:border-white border-black rounded-sm">
              <div className="ml-4 mt-4">Replies here</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
