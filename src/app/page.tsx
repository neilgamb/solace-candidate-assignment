"use client";

import { useEffect, useState, ChangeEvent, useRef } from "react";
import HighlightedText from "@/components/HighlightedText";
import { formatPhoneNumber } from "@/util/formatPhone";

// A simple custom hook to debounce any changing value
function useDebounce(value: string, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function Home() {
  // State to store the full advocate list, the filtered list, and the current search term
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10); // or any default page size
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const observerRef = useRef<IntersectionObserver | null>(null);

  // The debounced version of the search input
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Whenever the *debounced* search term changes, reset pagination
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setAdvocates([]); // Clear out old data
  }, [debouncedSearchTerm]);

  const fetchAdvocates = async () => {
    setIsLoading(true);

    try {
      // Include `search` in the query params
      const res = await fetch(
        `/api/advocates?page=${page}&limit=${limit}&search=${debouncedSearchTerm}`
      );
      const json = await res.json();

      console.log("Fetched data:", json);

      // Append the new page of data
      setAdvocates((prev) => [...prev, ...json.data]);

      // If we're on the last page, stop fetching
      if (json.pagination.page >= json.pagination.totalPages) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }

    setIsLoading(false);
  };

  // Fetch new page when `page` or `debouncedSearchTerm` changes
  useEffect(() => {
    if (hasMore) {
      fetchAdvocates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearchTerm]);

  // Intersection Observer: watch the sentinel for infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting && !isLoading && hasMore) {
        // Move to the next page
        setPage((prev) => prev + 1);
      }
    });

    const sentinel = document.getElementById("sentinel");
    if (sentinel) observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current && sentinel) {
        observerRef.current.unobserve(sentinel);
      }
    };
  }, [hasMore, isLoading]);

  // For the search input field
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Optional: a clear button
  const handleClearSearch = () => {
    setSearchTerm("");
  };

  return (
    <main className="h-screen p-4 pb-0 flex flex-col">
      {/* Main title */}
      <h1 className="text-2xl text-gray-800 font-semibold">Solace Advocates</h1>

      {/* Search input container */}
      <div className="my-4 flex items-center gap-2 relative focus-within:ring focus-within:ring-gray-400 rounded-lg max-w-4xl">
        <input
          className="flex-1 p-2 bg-gray-200 text-gray-800 placeholder-gray-400 rounded-lg focus:outline-none"
          onChange={handleSearchChange}
          value={searchTerm}
          placeholder="Search by name, city, degree or specialty"
        />
        {/* Clear button (shown only when there's something to clear) */}
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="px-4 py-2 transition-colors absolute right-0 rounded-r-md text-gray-400 hover:text-gray-500 font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* Table container with scroll overflow */}
      <div className="flex-1 overflow-y-auto overflow-x-auto rounded-lg overflow-hidden no-scrollbar relative">
        <table className="table-auto sm:table-fixed w-full border-collapse">
          {/* Table Header */}
          <thead className="sticky top-0 bg-emerald-900 text-white z-10 text-left">
            <tr>
              <th className="px-4 py-2">First Name</th>
              <th className="px-4 py-2">Last Name</th>
              <th className="px-4 py-2">City</th>
              <th className="px-4 py-2">Degree</th>
              <th className="px-4 py-2 w-2/5">Specialties</th>
              <th className="px-4 py-2">Years of Experience</th>
              <th className="px-4 py-2">Phone Number</th>
            </tr>
          </thead>

          {/* Table Body (dynamic rows based on filtered advocates) */}
          <tbody>
            {advocates.map((advocate, index) => (
              <tr
                key={advocate.id}
                className={`${
                  index === 0 ? "" : "border-t-2"
                } hover:bg-gray-50 hover:curor-pointer text-gray-500`}
              >
                {/* Each cell contains data from the advocate object. 
                    HighlightedText is used to visually highlight matches. */}
                <td className="px-4 py-2 align-top">
                  <HighlightedText
                    text={advocate.firstName}
                    query={searchTerm}
                  />
                </td>
                <td className="px-4 py-2 align-top">
                  <HighlightedText
                    text={advocate.lastName}
                    query={searchTerm}
                  />
                </td>
                <td className="px-4 py-2 align-top">
                  <HighlightedText text={advocate.city} query={searchTerm} />
                </td>
                <td className="px-4 py-2 align-top">
                  <HighlightedText text={advocate.degree} query={searchTerm} />
                </td>
                <td className="px-4 py-2 align-top">
                  {/* Render each specialty in a list item */}
                  {Array.isArray(advocate.specialties) &&
                    advocate.specialties.map((specialty, sIndex) => (
                      <li key={`${advocate.id}-specialty-${sIndex}`}>
                        <HighlightedText text={specialty} query={searchTerm} />
                      </li>
                    ))}
                </td>
                <td className="px-4 py-2 align-top">
                  {advocate.yearsOfExperience}
                </td>
                <td className="px-4 py-2 align-top">
                  {formatPhoneNumber(advocate.phoneNumber)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!searchTerm && (
          <div className="sticky inset-x-0 bottom-0 left-0 right-0 flex-1 text-center p-2 bg-white text-gray-400">
            Scroll to load more
          </div>
        )}
        {/* Our sentinel element to detect when user is near bottom */}
        <div id="sentinel"></div>
      </div>
    </main>
  );
}
