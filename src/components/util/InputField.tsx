export default function InputField({
  value,
  onChange,
  placeholder,
  required,
  type,
  readOnly,
}: {
  required?: boolean;
  type?: string;
  value: string;
  placeholder: string;
  readOnly?: boolean;
  onChange: (x: string) => void;
}) {
  const typeStr = !type ? "text" : type;
  return (
    <input
      type={typeStr}
      readOnly={!!readOnly}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-[100%] p-4 border border-gray-300 rounded-md
     text-gray-800 placeholder-gray-400 bg-white
     dark:text-white dark:placeholder-gray-300 dark:bg-gray-800"
      required={!!required}
    />
  );
}
