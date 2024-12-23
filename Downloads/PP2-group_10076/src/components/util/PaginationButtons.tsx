export default function PaginationButtons({
  page,
  changePage,
  hasNextPage,
}: {
  page: number;
  changePage: (x: number) => void;
  hasNextPage: boolean;
}) {
  return (
    <div className="flex items-center pb-6">
      {" "}
      {/* Added padding-bottom */}
      <button
        onClick={() => changePage(Math.max(1, page - 1))}
        className={`p-2 rounded-lg mx-2 ${
          page === 1
            ? "bg-gray-200 dark:bg-gray-500 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            : "bg-gray-300 dark:bg-gray-600 text-black dark:text-white hover:bg-gray-400 dark:hover:bg-gray-700"
        }`}
        disabled={page === 1}
      >
        Previous Page
      </button>
      <button
        onClick={() => changePage(page + 1)}
        className={`p-2 rounded-lg mx-2 ${
          hasNextPage
            ? "bg-gray-300 dark:bg-gray-600 text-black dark:text-white hover:bg-gray-400 dark:hover:bg-gray-700"
            : "bg-gray-200 dark:bg-gray-500 text-gray-500 dark:text-gray-400 cursor-not-allowed"
        }`}
        disabled={!hasNextPage}
      >
        Next Page
      </button>
    </div>
  );
}
