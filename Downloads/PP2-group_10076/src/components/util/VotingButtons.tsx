import React from "react";
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';

interface VotingButtonsProps {
  voteStatus: string;
  contentID: number;
  handleVote: (contentID: number, voteType: number) => void;
}

export default function VotingButtons({
    voteStatus, 
    contentID,
    handleVote, 
}: VotingButtonsProps) {
    return (
        <>
        {voteStatus === "upvote" ? (
            <button
              onClick={() => handleVote(contentID, 1)}
              className="p-2 text-black bg-gray-300 dark:text-white dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              <ThumbUpIcon />
            </button>
          ) : (
            <button
              onClick={() => handleVote(contentID, 1)}
              className="p-2 text-black bg-gray-300 dark:text-white dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              <ThumbUpOutlinedIcon/>
            </button>
          )}
          {voteStatus === "downvote" ? (
            <button
              onClick={() => handleVote(contentID, -1)}
              className="p-2 text-black bg-gray-300 dark:text-white dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              <ThumbDownIcon />
            </button>
          ) : (
            <button
              onClick={() => handleVote(contentID, -1)}
              className="p-2 text-black bg-gray-300 dark:text-white dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
            >
                <ThumbDownOutlinedIcon />
            </button>
          )}
          </>
    ) 
}

