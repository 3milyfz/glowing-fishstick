import { useEffect, useState } from "react";

type TemplateFiltersFormat = {
  titleContains?: string;
  explanationContains?: string;
  tags?: string[];
};

type filterOptionFn = (
  filters: TemplateFiltersFormat,
  val: string,
) => TemplateFiltersFormat;

interface Option {
  desc: string; // string description
  fn: filterOptionFn;
}

type filterOption = "title" | "explanation" | "tags";

const OPTIONS: { [key in filterOption]: Option } = {
  title: {
    desc: "Title Contains",
    fn: (filters, val) => {
      return { ...filters, titleContains: val };
    },
  },
  explanation: {
    desc: "Explanation Contains",
    fn: (filters, val) => {
      return { ...filters, explanationContains: val };
    },
  },
  tags: {
    desc: "Has Tag",
    fn: (filters, val) => {
      return {
        ...filters,
        tags: filters.tags ? filters.tags.concat([val.toLowerCase()]) : [val.toLowerCase()],
      };
    },
  },
};

export default function TemplateSearchForm({
  filters,
  setFilters,
}: {
  filters: TemplateFiltersFormat;
  setFilters: (f: TemplateFiltersFormat) => void;
}) {
  const [stringFilters, setStringFilters] = useState<
    {
      s: string;
      removeFn: (p: TemplateFiltersFormat) => TemplateFiltersFormat;
    }[]
  >([]);
  const [selectedFilter, setSelectedFilter] = useState<filterOption>("title");
  const [filterInput, setFilterInput] = useState("");

  const handleAddFilter = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" && filterInput.trim()) {
      e.preventDefault();
      const updatedFilters = OPTIONS[selectedFilter].fn(filters, filterInput);
      setFilters(updatedFilters);
      setFilterInput("");
    }
  };

  // Trigger search/filtering logic whenever filters change
  useEffect(() => {
    setStringFilters(getStringFilters(filters));
    // Add any fetch or search function call here
  }, [filters]);

  return (
    <div className="flex flex-col w-full md:w-[80%]">
      <div className="w-[100%] p-2 border border-gray-300 rounded flex flex-wrap items-center gap-2 bg-white dark:bg-gray-800 dark:text-white text-black">
        <FilterOptionSelect
          selected={selectedFilter}
          setSelected={setSelectedFilter}
        />
        {stringFilters.map((f, index) => (
          <div
            key={index}
            className="flex items-center bg-orange-200 text-blue-800 px-3 py-1 rounded-full"
          >
            <span>{f.s}</span>
            <button
              onClick={() => {
                const updatedFilters = f.removeFn(filters);
                setFilters(updatedFilters);
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
      onChange={(e) => setSelected(e.target.value as filterOption)}
      className="dark:bg-gray-800 dark:text-white"
    >
      {Object.keys(OPTIONS).map((val) => (
        <option key={val} value={val}>
          {OPTIONS[val as filterOption].desc}
        </option>
      ))}
    </select>
  );
};

const getStringFilters = (
  filters: TemplateFiltersFormat,
): {
  s: string;
  removeFn: (s: TemplateFiltersFormat) => TemplateFiltersFormat;
}[] => {
  const stringFilters = [];
  if (filters?.titleContains) {
    stringFilters.push({
      s: `titleContains: ${filters.titleContains}`,
      removeFn: (filters: TemplateFiltersFormat): TemplateFiltersFormat => {
        const { titleContains, ...newFilters } = filters;
        return newFilters;
      },
    });
  }
  if (filters?.explanationContains) {
    stringFilters.push({
      s: `explanationContains: ${filters.explanationContains}`,
      removeFn: (filters: TemplateFiltersFormat): TemplateFiltersFormat => {
        const { explanationContains, ...newFilters } = filters;
        return newFilters;
      },
    });
  }
  filters?.tags?.forEach((t) => {
    stringFilters.push({
      s: `tag: ${t}`,
      removeFn: (filters: TemplateFiltersFormat): TemplateFiltersFormat => {
        const { tags, ...newFilters } = filters;
        return { ...newFilters, tags: tags?.filter((x) => x !== t) };
      },
    });
  });
  return stringFilters;
};
