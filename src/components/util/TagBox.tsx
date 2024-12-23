export default function TagBox({
  val,
  isEditing,
  onRemove,
}: {
  val: string;
  isEditing: boolean;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center bg-blue-200 text-blue-800 px-3 py-1 rounded-full">
      {val}

      {/* {isEditing && (
        <button
          onClick={onRemove}
          className="text-black bg-gray-300 dark:text-white dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
        >
          &times;
        </button>
        )} */}
    </div>
  );
}
