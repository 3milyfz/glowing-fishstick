import { useRouter } from "next/router";
import React from "react";
import { useState, useEffect } from "react";
import { useLoginContext } from "@/components/auth/LoginContextProvider";
import TagBox from "@/components/util/TagBox";
import Comment from "@/components/util/Comment";
import Reports from "@/components/util/Reports";
import ParagraphWithTemplateLinks from "@/components/util/ParagraphWithTemplateLinks";
import { CommentFormat, ReportFormat } from "@/constants/constants";
import CommentSortForm from "@/components/posts/CommentSortForm";
import VotingButtons from "@/components/util/VotingButtons";
import PostStatusButton from "@/components/util/PostStatusButton";
import ShowReportButton from "@/components/util/ShowReportButton";
import CommentReportBox from "@/components/util/CommentReportBox";
import HideButton from "@/components/util/HideButton";

export default function SinglePostPage() {
  const router = useRouter();
  const { queryAPIWithAuth, queryAPIWithNoAuth, user } = useLoginContext();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creationTime, setCreationTime] = useState("");
  const [authorUsername, setAuthorUsername] = useState("");
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [comment_count, setCommentCounts] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [contentID, setContentID] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [temporaryDescription, setTemporaryDescription] = useState("");
  const [temporaryTitle, setTemporaryTitle] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showReportBox, setShowReportBox] = useState(false);
  const [reportText, setReportText] = useState("");
  const [report_counts, setReportCounts] = useState(0);
  const [reports, setReports] = useState<any[]>([]);
  const [showReports, setShowReports] = useState(false);
  const [sortMode, setSortMode] = useState("mostUpvoted");
  const [voteStatus, setVoteStatus] = useState("none");
  const [isLoading, setIsLoading] = useState(true);
  const [postNotFound, setPostNotFound] = useState(false);
  // const [postData, setPostData] = useState<any | PostInterface>(null);
  // console.log("user: ", user)
  const isLoggedIn = !!user;
  const apiCallFn = isLoggedIn ? queryAPIWithAuth : queryAPIWithNoAuth;

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

  const fetchPost = async (postID: string | number) => {
    setIsLoading(true);
    const response = await apiCallFn(`/post/search/${postID}`, {
      method: "POST",
      body: JSON.stringify({ sortMode: sortMode }),
    });
    if (!response.ok) {
      setPostNotFound(true);
      return;
    }
    const data = await response.json();
    setContentID(data.contentID || 0);
    setTitle(data.title || "");
    setDescription(data.description || "");
    setCreationTime(data.creationTime || "");
    setAuthorUsername(data.authorUsername || "");
    setUpvotes(data.upvotes || 0);
    setDownvotes(data.downvotes || 0);
    setCommentCounts(data.comment_counts || 0);
    setTags(data.tags || []);
    setComments(data.comments || []);
    setIsOwner(user?.username === data.authorUsername);
    setTemporaryDescription(data.description || "");
    setTemporaryTitle(data.title || "");
    setIsHidden(data.isHidden || false);
    setIsAdmin(user?.isAdmin || false);
    setReportCounts(data.report_counts || 0);
    setReports(data.reports || []);
    fetchVoteStatus();
    setIsLoading(false);
    setPostNotFound(false);
    // setPostData(data);
  };

  // Fetch post details based on postID
  useEffect(() => {
    const { id: postID } = router.query;
    if (!!postID) {
      // console.log(sortMode)
      fetchPost(postID as string | number);
    }
  }, [
    router.query,
    report_counts,
    sortMode,
    upvotes,
    downvotes,
    comment_count,
    report_counts,
    queryAPIWithNoAuth,
  ]);

  if (postNotFound) {
    return (
      <>
        <button
          onClick={() => router.push("/posts")}
          className="p-2 text-black bg-gray-300 dark:text-white dark:bg-gray-600 rounded-lg mx-2 mt-2 hover:bg-gray-400 dark:hover:bg-gray-500"
        >
          Back
        </button>
        <div className="flex flex-col items-center w-[100%]">
          <br className="hidden md:block"></br>
          <p className="text-black dark:text-white text-xl font-bold">
            This post is hidden/does not exist
          </p>
        </div>
      </>
    );
  }

  // COMMENT HANDLERS
  const handleAddCommentClick = () => {
    if (!user) {
      router.push("/login");
    }
    setShowCommentBox(!showCommentBox);
    setShowReportBox(false);
  };

  const handleCommentSubmit = () => {
    // console.log("Comment submitted: ", commentText);
    if (contentID) {
      apiCallFn(`/post/comment/create/${contentID}`, {
        method: "POST",
        body: JSON.stringify({ content: commentText }),
      }).then((response) => {
        if (response.ok) {
          response.json().then((data) => {
            // This data is data returned by comment instead of post
            // console.log("Comment added: ", data.comment_counts);
            setCommentCounts(comment_count + 1);
            setComments((comments) => [...comments, data]);
          });
        }
      });
    }
    setShowCommentBox(false);
    setCommentText("");
  };

  const handleCancelComment = () => {
    setShowCommentBox(false);
    setCommentText("");
  };

  // EDIT HANDLERS
  const handleEditPost = () => {
    if (!user) {
      router.push("/login");
    }
    setIsEditing(true);
    setShowCommentBox(false);
    setCommentText("");
    setShowReportBox(false);
    setReportText("");
  };

  const handleEditChange = (newText: string, type: string) => {
    if (type === "description") {
      setDescription(newText);
    } else if (type === "title") {
      setTitle(newText);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setDescription(temporaryDescription);
    setTitle(temporaryTitle);
  };

  const handleEditSubmit = () => {
    setIsEditing(false);
    apiCallFn(`/post/save/${contentID}`, {
      method: "PUT",
      body: JSON.stringify({
        title: title,
        description: description,
        tags: tags,
      }),
    }).then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          setTitle(data.title);
          setDescription(data.description || "");
          setTemporaryDescription(data.description || "");
          setTemporaryTitle(data.title || "");
          setTags(data.tags || []);
        });
      }
    });
  };

  // DELETE HANDLERS
  const handleDeletePost = () => {
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    if (contentID) {
      apiCallFn(`/post/delete/${contentID}`, { method: "DELETE" }).then(
        (response) => {
          if (response.ok) {
            setShowConfirmDelete(false);
            router.push("/posts");
          }
        },
      );
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  // REPORT HANDLERS
  const handleReportPost = () => {
    if (!user) {
      router.push("/login");
    }
    setShowReportBox(!showReportBox);
    setShowCommentBox(false);
  };

  const handleReportSubmit = () => {
    if (contentID) {
      apiCallFn(`/post/report/${contentID}`, {
        method: "POST",
        body: JSON.stringify({ reason: reportText }),
      }).then((response) => {
        if (response.ok) {
          response.json().then((data) => {
            setReportCounts(report_counts + 1);
            setShowReportBox(false);
            setReportText("");
            alert("Report submitted successfully");
          });
        } else if (!response.ok) {
          alert("Report failed to submit");
        }
      });
    }
  };

  const handleReportCancel = () => {
    setShowReportBox(false);
    setReportText("");
  };

  const handleShowReports = () => {
    setShowReports(!showReports);
  };

  // TAG HANDLERS
  const handleAddTag = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" && tagInput.trim().toLowerCase()) {
      e.preventDefault();
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  // VOTE HANDLERS
  const handleVote = (contentID: number, state: number) => {
    if (!user) {
      router.push("/login");
    }
    if (contentID) {
      queryAPIWithAuth(`/post/vote/${contentID}`, {
        method: "POST",
        body: JSON.stringify({ state }),
      }).then((response) => {
        if (response.ok) {
            if (state === 1) {
                setUpvotes(upvotes + 1);
            } else {
                setDownvotes(downvotes + 1);
            }
        }
      });
    }
  };

  // HIDE/SHOW HANDLERS
  const onToggleHidden = () => {
    if (contentID) {
      queryAPIWithAuth(`/post/hide/${contentID}`, {
        method: "POST",
        body: JSON.stringify({ hide: !isHidden }),
      }).then((response) => {
        if (response.ok) {
          // Clear all adding things when toggling hidden
          setIsHidden(!isHidden);
          setIsEditing(false);
          setShowCommentBox(false);
          setCommentText("");
          setShowReportBox(false);
          setReportText("");
          setShowConfirmDelete(false);
        }
      });
    }
  };
  return (
    <div className="border-top border-solid border-black dark:border-white ml-2">
      <button
        onClick={() => router.push("/posts")}
        className="p-2 text-black bg-gray-300 dark:text-white dark:bg-gray-600 rounded-lg mx-2 mt-2 hover:bg-gray-400 dark:hover:bg-gray-500"
      >
        Back
      </button>
      {isHidden && !isOwner && !isAdmin ? (
        <div className="flex flex-col items-center w-[100%]">
          <br className="hidden md:block"></br>
          <p className="text-black dark:text-white text-xl font-bold">
            This post is hidden/does not exist
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-left dark:text-white text-black  p-4 rounded-lg">
          <div className="w-[100%] flex items-left">
            <div className="flex-1"></div>
          </div>
          <div className="flex items-center dark:text-white text-black gap-4">
            <p>@{authorUsername}</p>
            <p>{creationTime}</p>
          </div>
          <div className="flex">
            <ParagraphWithTemplateLinks
              className={
                "text-3xl font-bold" +
                (!!isHidden
                  ? " text-red-400 dark:text-red-400"
                  : " text-black dark:text-white")
              }
              text={title + (isHidden ? " (Hidden)" : "")}
              type={"title"}
              isEditing={isEditing}
              onTextChange={handleEditChange}
            ></ParagraphWithTemplateLinks>
            <div className="flex-1"></div>
            {isAdmin && (
                <HideButton
                    isHidden={isHidden}
                    onClick={onToggleHidden}
                ></HideButton>
            )}
          </div>
          <div className="flex-1"></div>
          <hr className="dark:border-white border-black"></hr>
          <ParagraphWithTemplateLinks
            className="mt-2 text-xl"
            text={description}
            type={"description"}
            isEditing={isEditing}
            onTextChange={handleEditChange}
          ></ParagraphWithTemplateLinks>
          <br></br>
          <div className="flex-1"></div>
          {/* Preparing tags for edit mode */}
          {isEditing ? (
            <div className="w-full p-2 border border-gray-300 rounded flex flex-wrap items-center gap-2 bg-white dark:bg-gray-800 dark:text-white">
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center bg-blue-200 text-blue-800 px-3 py-1 rounded-full"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => {
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
          ) : (
            <div className="flex items-center gap-2 my-2">
              {tags.map((x, idx) => (
                <TagBox
                  val={x}
                  key={idx}
                  isEditing={isEditing}
                  onRemove={() => handleRemoveTag(idx)}
                ></TagBox>
              ))}
            </div>
          )}

          {/* Stats */}
          <p className="text-xs">{`${upvotes} Upvotes ${downvotes} Downvotes ${comment_count} Comments ${isAdmin ? report_counts + " Reports" : ""}`}</p>
          {/* Voting Buttons */}

          <div className="flex items-center gap-4 mt-2">
            {!isHidden && !!user && (
              <>
                <VotingButtons
                  contentID={contentID}
                  voteStatus={voteStatus}
                  handleVote={handleVote}>
                </VotingButtons>
                <PostStatusButton
                  type={"Add Comment"}
                  onClick={handleAddCommentClick}
                ></PostStatusButton>
                {isOwner && (
                  <>
                    <PostStatusButton
                        type={"Edit"}
                        onClick={handleEditPost}
                    ></PostStatusButton>
                    <PostStatusButton
                      type={"Delete"}
                      onClick={handleDeletePost}
                    ></PostStatusButton>
                  </>
                )}
                <PostStatusButton
                  type={"Add Report"}
                  onClick={handleReportPost}
                ></PostStatusButton>
                
              </>
            )}
            {isAdmin && (
              <ShowReportButton 
                reportCounts={report_counts} 
                showReports={showReports} 
                onClick={handleShowReports}>
            </ShowReportButton>
            )}
          </div>

          {/* Need to change to a dropdown here */}
          <CommentSortForm
            sortMode={sortMode}
            setFilters={setSortMode}
          ></CommentSortForm>
          {/* Show Confirm Delete Box */}
          {showConfirmDelete && (
            <div className="mt-4 p-4 bg-gray-200 dark:bg-gray-500 rounded-lg">
              <p className="text-black dark:text-white">
                Are you sure you want to delete this post?
              </p>
              <div className="mt-2">
                <button
                  onClick={handleConfirmDelete}
                  className="p-2 mr-3 text-black bg-gray-300 dark:text-white dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="p-2 text-black bg-gray-300 dark:text-white dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Cancel Delete
                </button>
              </div>
            </div>
          )}
          {/* Show Report Box */}
          {showReportBox && (
            <CommentReportBox 
                type={"Report"}
                value={reportText}
                onChange={setReportText}
                onSubmit={handleReportSubmit}
                onCancel={handleReportCancel}
            ></CommentReportBox>
          )}
          {/* Add Comment Box */}
          {showCommentBox && (
            <CommentReportBox
                type={"Comment"}
                value={commentText}
                onChange={setCommentText}
                onSubmit={handleCommentSubmit}
                onCancel={handleCancelComment}
            ></CommentReportBox>
          )}
          {/* Edit Box */}
          {isEditing && (
            <div className="flex flex-col mt-2 items-left dark:text-white text-black border-2 border-solid border-black dark:border-white p-4 rounded-lg">
              <button
                onClick={handleEditSubmit}
                className="p-2 mb-2 text-black bg-gray-300 dark:text-white dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Submit Edit
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-2 text-black bg-gray-300 dark:text-white dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancel Edit
              </button>
            </div>
          )}
          {/* Show Reports */}
          {showReports && (
            <div className="flex flex-col gap-2 ml-6">
              {reports.map((x: ReportFormat, idx) => (
                <Reports report={x} key={idx}></Reports>
              ))}
            </div>
          )}
          {/* Comments */}
          <hr className="dark:border-white border-black mt-2"></hr>
          {comments.map((x: CommentFormat) => (
            <Comment
              comment={x}
              postHidden={isHidden}
              key={x.contentID}
            ></Comment>
          ))}
        </div>
      )}
    </div>
  );
}
