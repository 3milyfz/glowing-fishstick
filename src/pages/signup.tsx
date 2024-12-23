import InputField from "@/components/util/InputField";
import { useLoginContext } from "@/components/auth/LoginContextProvider";
import ProfilePicturePicker from "@/components/profile/ProfilePicturePicker";
import { useRouter } from "next/router";
import { useState } from "react";

// Basic Signup
export default function Signup() {
  const { queryAPIWithNoAuth } = useLoginContext();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState(0);
  const [showError, setShowError] = useState(false);
  const [calculateErrors, setCalculateErrors] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalculateErrors(true);
    setShowError(false);
    console.log(username, password);
    const response = await queryAPIWithNoAuth("/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
        firstName,
        lastName,
        email,
        avatar,
        phone: !phone ? undefined : phone,
      }),
    });
    if (response.ok) {
      router.push("/login"); // redirect to home if login successful
    } else {
      setShowError(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-700">
      <form
        onSubmit={handleLogin}
        className="flex flex-col w-[90%] md:w-[70%] lg:w-[50%] items-center space-y-4 p-10 bg-white dark:bg-gray-500 rounded-lg shadow-md"
      >
        <InputField
          value={username}
          onChange={setUsername}
          required={true}
          placeholder="Username"
        ></InputField>
        <InputField
          value={password}
          onChange={setPassword}
          required={true}
          placeholder="Password"
          type="password"
        ></InputField>
        <InputField
          value={firstName}
          onChange={setFirstName}
          required={true}
          placeholder="First Name"
        ></InputField>
        <InputField
          value={lastName}
          onChange={setLastName}
          required={true}
          placeholder="Last Name"
        ></InputField>
        <InputField
          value={email}
          onChange={setEmail}
          required={true}
          placeholder="Email"
        ></InputField>
        {calculateErrors && !isValidEmail(email) && (
          <h1 className="text-red-500">
            Email format must be formatted as abc@def.ghi
          </h1>
        )}
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
        {showError && (
          <h1 className="text-red-500">
            Error Signing Up. Make sure Username and Email are unique.
          </h1>
        )}
      </form>
    </div>
  );
}

const isValidPhoneNumber = (phoneNumberString: string) => {
  const phoneRegex = /^\d{10}$/; // 10 digits, no space
  return !phoneNumberString || phoneRegex.test(phoneNumberString);
};

const isValidEmail = (emailString: string) => {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\.\w-]+$/g; // https://regexr.com/3e48o
  return !emailString || emailRegex.test(emailString);
};
