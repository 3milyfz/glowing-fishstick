import { useLoginContext } from "@/components/auth/LoginContextProvider";
import RequireAuth from "@/components/auth/RedirectIfNoAuth";
import NewPost from "@/components/Content/PostContent/NewPost";
import { useRouter } from "next/router";

export default function CreateNew() {
  const { queryAPIWithAuth } = useLoginContext();
  const router = useRouter();

  const savePost = async (
    title: string,
    description: string,
    tags: string[],
    successCallback: (successful: boolean) => void,
  ) => {
    const response = await queryAPIWithAuth("/post/save", {
      method: "POST",
      body: JSON.stringify({ title, description, tags }),
    });
    if (response.ok) {
      response.json().then((data) => {
        router.push(`/post/${data.id}`);
      });
      // TODO route to post
    }
    successCallback(response.ok);
  };

  return (
    <RequireAuth>
      <div className="h-screen flex flex-col items-center">
        <br className="hidden sm:block"></br>
        <NewPost submitFn={savePost}></NewPost>
      </div>
    </RequireAuth>
  );
}
