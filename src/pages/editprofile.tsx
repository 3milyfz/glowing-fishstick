import InputField from "@/components/util/InputField";
import { useLoginContext } from "@/components/auth/LoginContextProvider";
import RequireAuth from "@/components/auth/RedirectIfNoAuth";
import ProfilePictureCircle from "@/components/profile/ProfileCircle";
import ProfilePicturePicker from "@/components/profile/ProfilePicturePicker";
import { PROFILE_PHOTOS } from "@/constants/constants";
import { useRouter } from "next/router";
import { useState } from "react";

// Edit Profile
export default function EditProfile() {
  const { queryAPIWithAuth, setUser, user } = useLoginContext();
  const userObj = !user
    ? { firstName: "", lastName: "", phone: "", avatar: 0 }
    : user;
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState(userObj.firstName);
  const [lastName, setLastName] = useState(userObj.lastName);
  const [phone, setPhone] = useState(userObj.phone);
  const [avatar, setAvatar] = useState(userObj.avatar);
  const [showError, setShowError] = useState(false);
  const [calculateErrors, setCalculateErrors] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalculateErrors(true);
    setShowError(false);
    const response = await queryAPIWithAuth("/auth/changeInfo", {
      method: "POST",
      body: JSON.stringify({
        password,
        firstName,
        lastName,
        avatar,
        phone,
      }),
    });
    if (response.ok) {
      const newUser = await response.json();
      setUser(newUser);
      router.push("/profile"); // redirect to home if login successful
    } else {
      setShowError(true);
    }
  };

  return (
    <RequireAuth>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-700">
        <form
          onSubmit={handleLogin}
          className="flex flex-col w-[90%] md:w-[70%] lg:w-[50%] items-center space-y-4 p-10 bg-white dark:bg-gray-500 rounded-lg shadow-md"
        >
          <InputField
            value={password}
            onChange={setPassword}
            placeholder="New Password"
            type="password"
          ></InputField>
          <p className="dark:text-white text-black">First Name</p>
          <InputField
            value={firstName}
            onChange={setFirstName}
            placeholder="First Name"
          ></InputField>
          <p className="dark:text-white text-black">Last Name</p>
          <InputField
            value={lastName}
            onChange={setLastName}
            placeholder="Last Name"
          ></InputField>
          <p className="dark:text-white text-black">Phone No.</p>
          <InputField
            value={phone}
            onChange={setPhone}
            placeholder="Phone No."
          ></InputField>
          {calculateErrors && !isValidPhoneNumber(phone) && (
            <h1 className="text-red-500">
              Phone number must be 10 digits, no spaces
            </h1>
          )}

          <ProfilePicturePicker
            avatar={avatar}
            setAvatar={setAvatar}
          ></ProfilePicturePicker>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          >
            Submit
          </button>
          {showError && <h1 className="text-red-500">Error Signing Up</h1>}
        </form>
      </div>
    </RequireAuth>
  );
}

// TODO refactor for signup and editProfile
const isValidPhoneNumber = (phoneNumberString: string) => {
  const phoneRegex = /^\d{10}$/; // 10 digits, no space
  return !phoneNumberString || phoneRegex.test(phoneNumberString);
};
