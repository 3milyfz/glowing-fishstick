import React from "react";
import AddCommentIcon from '@mui/icons-material/AddComment';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

interface PostStatusButtonProps {
  type: string;
  onClick: () => void;
}

export default function PostStatusButton({
  type,
  onClick,
}: PostStatusButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-2 text-black bg-gray-300 dark:text-white dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500`}
    >
      {type === "Add Comment" || type === "Add Reply" ? <AddCommentIcon /> : 
      type === "Edit" ? <EditOutlinedIcon /> : 
      type === "Delete" ? <DeleteOutlineOutlinedIcon/> :
      type}
    </button>
  );
}