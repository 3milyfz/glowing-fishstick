import React from "react";
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';


interface HideButtonProps {
    isHidden: boolean;
    onClick: () => void;
}

export default function HideButton({
    isHidden,
    onClick,
}: HideButtonProps) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col p-2 text-black bg-gray-300 dark:text-white dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 padding-right-2"
            >
            {isHidden ? <VisibilityOutlinedIcon/> : <VisibilityOffOutlinedIcon />}
        </button>
    );
}