import { PostFiltersFormat } from "@/constants/constants";
import { useEffect, useState } from "react";
import { useLoginContext } from "../auth/LoginContextProvider";
import InputField from "../util/InputField";

type filterOptionFn = (
  filters: PostFiltersFormat,
  val: string,
) => PostFiltersFormat;

interface Option {
  desc: string; // string description
  fn: filterOptionFn;
}

type filterOption = "title" | "content" | "tags" | "templates";

const OPTIONS: { [key: string]: Option } = {
  title: {
    desc: "Title Contains",
    fn: (filters, val) => {
      return { ...filters, title: val };
    },
  },
  content: {
    desc: "Content Contains",
    fn: (filters, val) => {
      return { ...filters, content: val };
    },
  },
  tags: {
    desc: "Has Tag",
    fn: (filters, val) => {
      return {
        ...filters,
        tags: filters.tags ? filters.tags.concat([val]) : [val],
      };
    },
  },
  templates: {
    desc: "Description Mentions Template",
    fn: (filters, val) => {
      return {
        ...filters,
        templates: filters.templates ? filters.templates.concat([val]) : [val],
      };
    },
  },
};

export default function PostSearchForm({
  filters,
  setFilters,
}: {
  filters: PostFiltersFormat;
  setFilters: (f: PostFiltersFormat) => void;
}) {
  const [stringFilters, setStringFilters] = useState<
    { s: string; removeFn: (p: PostFiltersFormat) => PostFiltersFormat }[]
  >([]);
  const [selectedFilter, setSelectedFilter] = useState<filterOption>("title");
  const [filterInput, setFilterInput] = useState("");
  const { user } = useLoginContext();

  const handleAddFilter = (e: React.KeyboardEvent<HTMLElement>) => {
    // If press enter, add new tag
    if (e.key === "Enter" && filterInput.trim()) {
      e.preventDefault();
      setFilters(OPTIONS[selectedFilter]?.fn(filters, filterInput));
      setFilterInput("");
    }
  };

  useEffect(() => {
    setStringFilters(getStringFilters(filters, !!user?.isAdmin));
  }, [filters, user]);

  return (
    <div className="flex flex-col w-full md:w-[80%]">
      <div className="w-[100%] p-2 border border-gray-300 rounded flex flex-wrap items-center gap-2 bg-white dark:bg-gray-800 dark:text-white text-black">
        <FilterOptionSelect
          selected={selectedFilter}
          setSelected={setSelectedFilter}
        ></FilterOptionSelect>
        {stringFilters.map((f, index) => (
          <div
            key={index}
            className="flex items-center bg-orange-200 text-blue-800 px-3 py-1 rounded-full"
          >
            <span>{f.s}</span>
            <button
              onClick={() => {
                setFilters(f.removeFn(filters));
              }}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              &times;
            </button>
          </div>
        ))}
        <input
          type="text"
          placeholder="Add filter..."
          value={filterInput}
          onChange={(e) => setFilterInput(e.target.value)}
          onKeyDown={handleAddFilter}
          className="flex-1 p-1 focus:outline-none dark:bg-gray-800 dark:text-white"
        />
      </div>
      <button
        className="dark:text-white text-black p-2 my-2 rounded-md bg-gray-200 dark:bg-gray-500"
        onClick={() => setFilters({})}
      >
        Clear
      </button>
      <select
        value={filters.sortMode || "creationTime"}
        onChange={(e) => setFilters({ ...filters, sortMode: e.target.value })}
        className="p-2 text-black bg-white dark:bg-gray-800 dark:text-white"
      >
        <option value="creationTime">Creation Time</option>
        <option value="mostUpvoted">Most Upvoted</option>
        <option value="mostDownvoted">Most Downvoted</option>
        {!!user?.isAdmin && <option value="mostReported">Most Reported</option>}
      </select>
    </div>
  );
}

const FilterOptionSelect = ({
  selected,
  setSelected,
}: {
  selected: filterOption;
  setSelected: (f: filterOption) => void;
}) => {
  return (
    <select
      value={selected}
      onChange={(e) => {
        setSelected(e.target.value as filterOption);
      }}
      className="dark:bg-gray-800 dark:text-white"
    >
      {Object.keys(OPTIONS).map((val, idx) => {
        return (
          <option key={idx} value={val}>
            {OPTIONS[val].desc}
          </option>
        );
      })}
    </select>
  );
};

const getStringFilters = (
  filters: PostFiltersFormat,
  isAdmin: boolean,
): { s: string; removeFn: (s: PostFiltersFormat) => PostFiltersFormat }[] => {
  const stringFilters = [];
  if ("title" in filters) {
    stringFilters.push({
      s: `titleContains: ${filters.title}`,
      removeFn: (filters: PostFiltersFormat): PostFiltersFormat => {
        const { title, ...newFilters } = filters;
        return newFilters;
      },
    });
  }
  if ("content" in filters) {
    stringFilters.push({
      s: `contentContains: ${filters.content}`,
      removeFn: (filters: PostFiltersFormat): PostFiltersFormat => {
        const { content, ...newFilters } = filters;
        return newFilters;
      },
    });
  }
  if ("tags" in filters) {
    filters.tags?.forEach((t) => {
      stringFilters.push({
        s: `tag: ${t}`,
        removeFn: (filters: PostFiltersFormat): PostFiltersFormat => {
          const { tags, ...newFilters } = filters;
          return { ...newFilters, tags: tags?.filter((x) => x != t) };
        },
      });
    });
  }
  if ("templates" in filters) {
    filters.templates?.forEach((t) => {
      stringFilters.push({
        s: `template: @${t}`,
        removeFn: (filters: PostFiltersFormat): PostFiltersFormat => {
          const { templates, ...newFilters } = filters;
          return { ...newFilters, templates: templates?.filter((x) => x != t) };
        },
      });
    });
  }
  if (isAdmin) {
    stringFilters.push({
      s: !!filters.showHidden ? "showHidden" : "hideHidden",
      removeFn: (filters: PostFiltersFormat): PostFiltersFormat => {
        console.log(filters.showHidden);
        const newHidden = !filters.showHidden;
        return { ...filters, showHidden: newHidden };
      },
    });
  }
  return stringFilters;
};
