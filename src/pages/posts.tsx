import { useLoginContext } from "@/components/auth/LoginContextProvider";
import PaginationButtons from "@/components/util/PaginationButtons";
import SmallPostBox from "@/components/util/SmallPostBox";
import { PostFiltersFormat, PostFormat } from "@/constants/constants";
import TwoOptionButton from "@/components/util/TwoOptionButton";
import { useEffect, useState } from "react";
import PostSearchForm from "@/components/posts/PostSearchForm";

export default function PostsGrid() {
  const { queryAPIWithAuth, queryAPIWithNoAuth, user } = useLoginContext();
  const [posts, setPosts] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [showUserOnly, setShowUserOnly] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [filters, setFilters] = useState<PostFiltersFormat>({
    showHidden: !!user?.isAdmin,
  });
  const [shouldCallAPI, setShouldCallAPI] = useState(true);
  const pageSize = 9;

  const loadData = async () => {
    setShouldCallAPI(false);
    const queryFn = user ? queryAPIWithAuth : queryAPIWithNoAuth;
    const response = await queryFn("/post/search", {
      method: "POST",
      body: JSON.stringify({
        ...filters,
        fromUser: showUserOnly,
        pageNumber: pageNo,
        pageSize: pageSize,
      }),
    });
    if (!response.ok) {
      return;
    }
    const data = await response.json();
    const { posts, count } = data;
    setPosts(posts);

    setHasNextPage(count > pageNo * 9);
    setShouldCallAPI(true); // after done loading, we can call API again
  };

  useEffect(() => {
    setShouldCallAPI(false); // don't call API while adjusting pageNo.
    setPageNo(1);
    loadData();
  }, [filters, showUserOnly, user]);

  useEffect(() => {
    if (shouldCallAPI) {
      loadData();
    }
  }, [pageNo]);

  return (
    <div className="flex flex-col items-center w-[100%]">
      <br className="hidden md:block"></br>
      {!!user && (
        <TwoOptionButton
          leftSelected={showUserOnly}
          setLeftSelected={setShowUserOnly}
          leftValue="Yours"
          rightValue="All"
        ></TwoOptionButton>
      )}
      <br></br>
      <br></br>
      <PostSearchForm
        filters={filters}
        setFilters={setFilters}
      ></PostSearchForm>
      <br></br>

      <div className="w-[100%] md:w-[80%] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post: PostFormat, idx) => {
          return (
            <SmallPostBox key={idx} post={post} maxChars={150}></SmallPostBox>
          );
        })}
      </div>
      <br></br>
      <PaginationButtons
        page={pageNo}
        changePage={setPageNo}
        hasNextPage={hasNextPage}
      ></PaginationButtons>
    </div>
  );
}
