import { useState, useEffect } from "react";
import { useLoginContext } from "@/components/auth/LoginContextProvider";
import { CommentFormat } from "@/constants/constants";
import Reply from "@/components/util/Reply";
import { useRouter } from "next/router";
import Reports from "@/components/util/Reports";
import VotingButtons from "@/components/util/VotingButtons";
import PostStatusButton from "@/components/util/PostStatusButton";
import ShowReportButton from "@/components/util/ShowReportButton";
import CommentReportBox from "@/components/util/CommentReportBox";
import HideButton from "@/components/util/HideButton";

interface CommentProps {
  comment: CommentFormat;
  postHidden?: boolean; // if post is hidden, make users unable to comment
}

export default function Comment({ comment, postHidden }: CommentProps) {
  const router = useRouter();
  const { queryAPIWithAuth, queryAPIWithNoAuth, user } = useLoginContext();
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [commentText, setCommentText] = useState(comment.text);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState(comment.replies || []);
  const [upvotes, setUpvotes] = useState(comment.upvotes || 0);
  const [downvotes, setDownvotes] = useState(comment.downvotes || 0);
  const [replyCounts, setReplyCounts] = useState(comment.reply_counts || 0);
  const [isHidden, setIsHidden] = useState(comment.isHidden || false);
  const isOwner = user?.username === comment.authorUsername;
  const isAdmin = user?.isAdmin;
  const [showReports, setShowReports] = useState(false);
  const [reports, setReports] = useState(comment.reports || []);
  const [reportText, setReportText] = useState("");
  const [showReportBox, setShowReportBox] = useState(false);
  const [reportCounts, setReportCounts] = useState(comment.report_counts || 0);
  const [voteStatus, setVoteStatus] = useState("none");
  const isLoggedIn = !!user;
  const apiCallFn = isLoggedIn ? queryAPIWithAuth : queryAPIWithNoAuth;

  useEffect(() => {
    if (comment.contentID) {
      apiCallFn(`/post/comment/get/${comment.contentID}`, {
        method: "GET",
      })
        .then((response) => {
          if (response.ok) {
            response.json().then((data) => {
              setUpvotes(data.upvotes || 0);
              setDownvotes(data.downvotes || 0);
              setIsHidden(data.isHidden || false);
              setReports(data.reports || []);
              setReportCounts(data.report_counts || 0);
              setReplyCounts(data.reply_counts || 0);
              fetchVoteStatus();
            });
          }
        })
        .catch((err) => {
          console.error("Error fetching comment details: ", err);
        });
    }
  }, [upvotes, downvotes, reportCounts, isHidden, voteStatus]);

  useEffect(() => {
    setReplies(comment.replies || []);
  }, [comment.replies]);

  // REPLY HANDLERS
  const handleAddReplyClick = () => {
    setShowReplyBox(!showReplyBox);
    setShowReportBox(false);
  };

  const handleReplySubmit = async () => {
    if (!user) {
      router.push("/login");
    }
    if (user && replyText.trim()) {
      apiCallFn(`/post/comment/create/${comment.contentID}`, {
        method: "POST",
        body: JSON.stringify({ content: replyText }),
      }).then((response) => {
        if (response.ok) {
          setReplyText("");
          setReplyCounts(replyCounts + 1);
          response.json().then((data) => {
            setReplies([...replies, data]);
          });
        }
      });
    }
    setShowReplyBox(false);
  };

  const handleCancelReply = () => {
    setShowReplyBox(false);
    setReplyText("");
  };

  // VOTE HANDLERS
  const handleVote = (contentID: number, state: number) => {
    if (!user) {
      router.push("/login");
    }
    if (contentID) {
      // console.log("Hi!")
      apiCallFn(`/post/vote/${contentID}`, {
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

  const fetchVoteStatus = async () => {
    if (!isLoggedIn) {
      return;
    }
    const response = await apiCallFn(
      `/post/comment/votestatus/${comment.contentID}`,
      {
        method: "POST",
      },
    );
    if (response.ok) {
      const { status } = await response.json();
      setVoteStatus(status);
    }
  };

  // REPORT HANDLERS
  const handleReportPost = () => {
    if (!user) {
      router.push("/login");
    }
    setShowReportBox(!showReportBox);
    setShowReplyBox(false);
  };

  const handleReportSubmit = () => {
    if (comment.contentID) {
      apiCallFn(`/post/report/${comment.contentID}`, {
        method: "POST",
        body: JSON.stringify({ reason: reportText }),
      }).then((response) => {
        if (response.ok) {
          response.json().then((data) => {
            setReports([...reports, data]);
            setReportText("");
            setShowReportBox(false);
            setReportCounts(reportCounts + 1);
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

  const onToggleHidden = () => {
    apiCallFn(`/post/hide/${comment.contentID}`, {
      method: "POST",
      body: JSON.stringify({ hide: !isHidden }),
    }).then((response) => {
      if (response.ok) {
        setIsHidden(!isHidden);
        setShowReplyBox(false);
        setShowReportBox(false);
        setReportText("");
        setReplyText("");
      }
    });
  };
  return (
    <>
      {isHidden && !isOwner && !isAdmin ? (
        // Show "This comment is hidden" if the comment is hidden
        <div className="flex flex-col items-left dark:text-white text-black border-l border-solid border-black dark:border-white p-4 rounded-lg">
          <p>This comment is hidden</p>
        </div>
      ) : (
        <div className="flex flex-col items-left dark:text-white text-black border-l border-solid border-black dark:border-white p-2 rounded-lg mt-2">
          {/* Comment Header */}
          <div className="w-[100%] flex items-left">
            <div
              className={
                "flex items-center gap-4" +
                (!!isHidden
                  ? " text-red-400 dark:text-red-500"
                  : " text-black dark:text-white")
              }
            >
              <p>@{comment.authorUsername + (isHidden ? " (Hidden)" : "")}</p>
              <p>{comment.creationTime}</p>
            </div>
            <div className="flex-1"></div>
            {isAdmin && (
              <HideButton
                isHidden={isHidden}
                onClick={onToggleHidden}
              ></HideButton>
            )}
          </div>
          <hr className="dark:border-white border-black"></hr>
          <p className="mt-2 text-xl">{commentText}</p>
          <p className="text-xs">
            {`${upvotes} Upvotes ${downvotes} Downvotes ${replyCounts} Replies ${
              isAdmin ? reportCounts + " Reports" : ""
            }`}
          </p>

          {/* Reply, Upvote, Downvote Buttons */}
          <div className="flex items-center gap-4 mt-4">
            {!postHidden && !!user && !isHidden && (
              <>
                <VotingButtons
                  contentID={comment.contentID}
                  voteStatus={voteStatus}
                  handleVote={handleVote}>
                </VotingButtons>
                <PostStatusButton
                  type={"Add Reply"}
                  onClick={handleAddReplyClick}
                ></PostStatusButton>
                <PostStatusButton
                  type={"Add Report"}
                  onClick={handleReportPost}
                ></PostStatusButton>
              </>
            )}
            {isAdmin && (
              <ShowReportButton 
                reportCounts={reportCounts} 
                showReports={showReports} 
                onClick={handleShowReports}>
            </ShowReportButton>
            )}
          </div>
          {/* Report Box */}
          {showReportBox && (
            <CommentReportBox 
              type={"Report"}
              value={reportText}
              onChange={setReportText}
              onSubmit={handleReportSubmit}
              onCancel={handleReportCancel}
            ></CommentReportBox>
          )}

          {/* Reply Box */}
          {showReplyBox && (
            <CommentReportBox
              type={"Reply"}
              value={replyText}
              onChange={setReplyText}
              onSubmit={handleReplySubmit}
              onCancel={handleCancelReply}
            ></CommentReportBox>
          )}
          {/* Render Reports */}
          {showReports &&
            reports.map((x, idx) => <Reports report={x} key={idx}></Reports>)}
          {/* Render Replies */}
          <hr className="dark:border-white border-black mt-2"></hr>
          <div className="ml-6 mt-3">
            {replies.map((reply: CommentFormat) => (
              <Reply
                key={reply.contentID}
                reply={reply}
                parentHidden={isHidden || postHidden}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
