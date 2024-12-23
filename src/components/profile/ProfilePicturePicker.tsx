import { PROFILE_PHOTOS } from "@/constants/constants";
import ProfilePictureCircle from "./ProfileCircle";

export default function ProfilePicturePicker({
  avatar,
  setAvatar,
}: {
  avatar: number;
  setAvatar: (avatar: number) => void;
}) {
  return (
    <div className="flex gap-4 items-center">
      {PROFILE_PHOTOS.map((x, idx) => {
        return (
          <div onClick={() => setAvatar(x)}>
            <ProfilePictureCircle
              key={idx}
              img={x.toString()}
              size="large"
              shrinkAsScreenShrinks={true}
              border={x === avatar}
            ></ProfilePictureCircle>
          </div>
        );
      })}
    </div>
  );
}
