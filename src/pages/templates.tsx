import { useLoginContext } from "@/components/auth/LoginContextProvider";
import PaginationButtons from "@/components/util/PaginationButtons";
import SmallTemplateBox from "../components/util/SmallTemplateBox";
import TwoOptionButton from "@/components/util/TwoOptionButton";
import { useEffect, useState } from "react";
import { Template, TemplateFormat } from "@/constants/constants";
import TemplateSearchForm from "@/components/templates/TemplateSearchForm";

export default function TemplatesGrid() {
  const { queryAPIWithAuth, queryAPIWithNoAuth, user } = useLoginContext();
  const [templates, setTemplates] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [showUserOnly, setShowUserOnly] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0); // Track total templates count
  const [filters, setFilters] = useState<{
    titleContains?: string;
    explanationContains?: string;
    tags?: string[];
  }>({});

  const loadData = async () => {
    const queryFn = user ? queryAPIWithAuth : queryAPIWithNoAuth;

    // Construct query parameters with pagination
    const params = new URLSearchParams({
      pageNumber: pageNo.toString(),
      pageSize: "9",
    });

    if (showUserOnly && user) {
      params.append("username", user.username.toString());
    }

    // Add filters to the query parameters
    if (filters?.titleContains)
      params.append("titleContains", filters.titleContains);
    if (filters?.explanationContains)
      params.append("explanationContains", filters.explanationContains);
    if (filters?.tags && filters.tags.length > 0)
      params.append("tags", filters.tags.join(","));

    const response = await queryFn(`/template/search?${params.toString()}`, {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();

      setTemplates(data.templates);
      setTotalCount(data.totalCount || 0); // Update total count from API
      setHasNextPage(data.hasNextPage || false); // Use hasNextPage from API
    } else {
      setTemplates([]);
      setTotalCount(0);
      setHasNextPage(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, pageNo, showUserOnly, filters]);

  return (
    <div className="flex flex-col items-center w-[100%]">
      <br className="hidden md:block" />
      {user && (
        <>
          <TwoOptionButton
            leftSelected={showUserOnly}
            setLeftSelected={setShowUserOnly}
            leftValue="Yours"
            rightValue="All"
          />
        </>
      )}
      <br></br>
      <br></br>
      <TemplateSearchForm filters={filters} setFilters={setFilters} />
      <br></br>
      <div className="w-[100%] md:w-[80%] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.length > 0 ? (
          templates.map((template: TemplateFormat) => (
            <SmallTemplateBox
              template={template}
              maxChars={150}
              key={template.id}
            />
          ))
        ) : (
          <p>No templates available</p>
        )}
      </div>
      <br />
      <PaginationButtons
        page={pageNo}
        changePage={setPageNo}
        hasNextPage={hasNextPage}
      />
    </div>
  );
}
