// Sliding button, that lets the user select one of two options
export default function TwoOptionButton({
  leftSelected,
  setLeftSelected,
  leftValue,
  rightValue,
}: {
  leftSelected: boolean;
  setLeftSelected: (x: boolean) => void;
  leftValue: string;
  rightValue: string;
}) {
  return (
    <>
      <div className="relative w-[100%] md:w-[70%] lg:w-[50%] h-10 bg-gray-200 md:rounded-lg flex items-center cursor-pointer min-h-10">
        {/* Sliding background */}
        <div
          className={`absolute top-0 left-0 h-full w-1/2 bg-gray-500 dark:bg-gray-800 md:rounded-lg transition-transform duration-300 transform ${
            leftSelected ? "translate-x-0" : "translate-x-full"
          } z-0`}
        />

        {/* Options */}
        <div
          onClick={() => setLeftSelected(true)}
          className={`flex-auto text-center z-10 ${
            leftSelected ? "text-white" : "text-gray-800"
          }`}
        >
          {leftValue}
        </div>
        <div
          onClick={() => setLeftSelected(false)}
          className={`flex-auto text-center z-10 ${
            !leftSelected ? "text-white" : "text-gray-800"
          }`}
        >
          {rightValue}
        </div>
      </div>
    </>
  );
}
