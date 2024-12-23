import Image from "next/image";

const PROFILE_PHOTO_PATH = "/profile_photos"; // starts searching at public

interface ProfileCircleProps {
  img: string | number;
  size: "small" | "large";
  border?: boolean;
  shrinkAsScreenShrinks?: boolean; // false > grow
}

export default function ProfilePictureCircle({
  img,
  size,
  border,
  shrinkAsScreenShrinks,
}: ProfileCircleProps) {
  // TODO see if we can refactor this out to other classes, low priority. Right now, this works for our applications.
  const divClass =
    size === "small"
      ? "w-6 h-6 md:w-12 md:h-12 relative overflow-hidden rounded-full"
      : !shrinkAsScreenShrinks
        ? "w-48 h-48 md:w-36 md:h-36 relative overflow-hidden rounded-full"
        : "w-24 h-24 md:w-36 md:h-36 lg:w-36 lg:h-36 relative overflow-hidden rounded-full";

  const borderDivClass =
    size === "small"
      ? "border border-2 border-gray-500 dark:border-gray-200 rounded-full"
      : "border border-8 border-gray-400 dark:border-gray-200 rounded-full";
  return (
    <div className={border ? borderDivClass : ""}>
      <div className={divClass}>
        <Image
          src={`${PROFILE_PHOTO_PATH}/${img}.jpg`}
          alt="profile photo"
          layout="fill"
          objectFit="cover"
        ></Image>
      </div>
    </div>
  );
}
