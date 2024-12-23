import { useLoginContext } from "../auth/LoginContextProvider";

export default function PostSearchForm({
  sortMode,
  setFilters,
}: {
  sortMode: string;
  setFilters: (sortMode: string) => void;
}) {
  const { user } = useLoginContext();

  return (
    <div className="flex items-center space-x-2 mt-2">
      <label htmlFor="sort" className="text-black dark:text-white">
        Sort By:{" "}
      </label>
      <select
        id="sort"
        value={sortMode || "Most Upvoted"}
        onChange={(e) => setFilters(e.target.value)}
        className="p-2 text-black bg-white dark:bg-gray-800 dark:text-white"
      >
        <option value="mostUpvoted">Most Upvoted</option>
        <option value="mostDownvoted">Most Downvoted</option>
        {!!user?.isAdmin && <option value="mostReported">Most Reported</option>}
      </select>
    </div>
  );
}
