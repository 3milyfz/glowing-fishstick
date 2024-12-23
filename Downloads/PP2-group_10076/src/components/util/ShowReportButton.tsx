import React from "react";

interface ShowReportButtonProps {
  reportCounts: number;
  showReports: boolean;
  onClick: () => void;
}

export default function ShowReportButton({
    reportCounts, 
    showReports,
    onClick,
}: ShowReportButtonProps) {
    return (
    <button
        onClick={onClick}
        disabled={reportCounts === 0} // Disable the button when report_counts is 0
        className={`p-2 text-black bg-gray-300 dark:text-white dark:bg-gray-600 rounded-lg margin-2 ${
            reportCounts === 0
            ? "cursor-not-allowed opacity-50"
            : "hover:bg-gray-400 dark:hover:bg-gray-500"
        }`}
        >
        {reportCounts === 0 ? "No Reports" : showReports ? "Hide Reports" : "Show Reports"}
    </button>
    );
}
