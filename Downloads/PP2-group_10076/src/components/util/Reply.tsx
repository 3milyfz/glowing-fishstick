import { useState, useEffect } from "react";
import { useLoginContext } from "@/components/auth/LoginContextProvider";
import { CommentFormat } from "@/constants/constants";
import { useRouter } from "next/router";
import Reports from "@/components/util/Reports";
import VotingButtons from "@/components/util/VotingButtons";
import PostStatusButton from "@/components/util/PostStatusButton";
import ShowReportButton from "@/components/util/ShowReportButton";
import CommentReportBox from "@/components/util/CommentReportBox";
import HideButton from "@/components/util/HideButton";

interface ReplyProps {
  reply: CommentFormat;
  parentHidden?: boolean; // if parent comment or parent post is hidden, don't show reply/voting buttons
}

export default function Reply({ reply, parentHidden }: ReplyProps) {
  const router = useRouter();
  const { queryAPIWithAuth, queryAPIWithNoAuth, user } = useLoginContext();
  const [upvotes, setUpvotes] = useState(reply.upvotes || 0);
  const [downvotes, setDownvotes] = useState(reply.downvotes || 0);
  const [isHidden, setIsHidden] = useState(reply.isHidden || false);
  const isOwner = user?.username === reply.authorUsername;
  const isAdmin = user?.isAdmin;
  const [showReports, setShowReports] = useState(false);
  const [reports, setReports] = useState(reply.reports || []);
  const [reportText, setReportText] = useState("");
  const [showReportBox, setShowReportBox] = useState(false);
  const [reportCounts, setReportCounts] = useState(reply.report_counts || 0);
  const [voteStatus, setVoteStatus] = useState("none");
  const isLoggedIn = !!user;
  const apiCallFn = isLoggedIn ? queryAPIWithAuth : queryAPIWithNoAuth;
  // console.log(user)
  // console.log(isAdmin)
  useEffect(() => {
    if (reply.contentID) {
      apiCallFn(`/post/comment/get/${reply.contentID}`, {
        method: "GET",
      })
        .then((response) => {
          if (response.ok) {
            response.json().then((data) => {
              // console.log(data)
              setUpvotes(data.upvotes || 0);
              setDownvotes(data.downvotes || 0);
              setReports(data.reports || []);
              setReportCounts(data.report_counts || 0);
              setIsHidden(data.isHidden || false);
              fetchVoteStatus();
            });
          }
        })
        .catch((err) => {
          console.error("Error fetching comment details: ", err);
        });
    }
  }, [upvotes, downvotes, reportCounts, isHidden, parentHidden]);

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
      `/post/comment/votestatus/${reply.contentID}`,
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
    setShowReportBox(!showReportBox);
  };

  const handleReportSubmit = () => {
    if (!user) {
      router.push("/login");
    }
    if (reply.contentID) {
      apiCallFn(`/post/report/${reply.contentID}`, {
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

  // HIDE/SHOW HANDLERS
  const onToggleHidden = () => {
    if (reply.contentID) {
      apiCallFn(`/post/hide/${reply.contentID}`, {
        method: "POST",
        body: JSON.stringify({ hide: !isHidden }),
      }).then((response) => {
        if (response.ok) {
          setIsHidden(!isHidden);
        }
      });
    }
  };
  // console.log(parentHidden)
  return (
    <>
      {isHidden && !isOwner && !isAdmin ? (
        // Show "This comment is hidden" if the comment is hidden
        <div className="flex flex-col font-bold items-left dark:text-white text-black border-l border-solid border-black dark:border-white p-4 rounded-lg">
          <p>This comment is hidden</p>
        </div>
      ) : (
        <div className="flex flex-col items-left dark:text-white text-black border-l border-solid border-black dark:border-white p-2 rounded-lg">
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
              <p>@{reply.authorUsername + (isHidden ? " (Hidden)" : "")}</p>
              <p>{reply.creationTime}</p>
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
          <p className="mt-2 text-xl">{reply.text}</p>
          <p className="text-xs">
            {`${upvotes} Upvotes, ${downvotes} Downvotes ${
              isAdmin ? reportCounts + " Reports" : ""
            }`}
          </p>

          {/* Reply, Upvote, Downvote Buttons */}
          <div className="flex items-center gap-4 mt-4">
            {!parentHidden && !!user && !isHidden && (
              <>
                <VotingButtons
                  contentID={reply.contentID}
                  voteStatus={voteStatus}
                  handleVote={handleVote}>
                </VotingButtons>
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
          {/* Render Reports */}
          {showReports &&
            reports.map((x, idx) => <Reports report={x} key={idx}></Reports>)}
        </div>
      )}
    </>
  );
}
