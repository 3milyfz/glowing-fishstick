import React from "react"

interface CommentReportBoxProps {
    type: string;
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
}

export default function CommentReportBox({
    type,
    value,
    onChange,
    onSubmit,
    onCancel,
}: CommentReportBoxProps) {
    return (
    <div className="ml-4 mt-4 p-4 bg-gray-200 dark:bg-gray-500 rounded-lg">
            <p className="text-black dark:text-white mb-2">New {type}: </p>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={"Enter your " + type.toLowerCase() + " here"}
                className="w-[90%] p-4 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 bg-white dark:text-white dark:placeholder-gray-300 dark:bg-gray-800"
                required
            />
            <div className="flex items-center gap-3 mt-2">
                <button
                    onClick={onSubmit}
                    className="p-2 text-black bg-gray-300 dark:text-white dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                    Submit
                </button>
                <button
                    onClick={onCancel}
                    className="p-2 text-black bg-gray-300 dark:text-white dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}