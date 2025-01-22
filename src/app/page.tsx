"use client";

import { useEffect, useState, useRef, useMemo, ChangeEvent } from "react";
import { debounce } from "lodash";
import HighlightedText from "@/components/HighlightedText";
import { formatPhoneNumber } from "@/util/formatPhone";

export default function Home() {
  /**
   * ---------------------------
   *      State Declarations
   * ---------------------------
   */

  // Infinite scroll + general
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);

  // Search
  // `typedValue`: what the user is typing in the search box, updated on every keystroke
  // `searchTerm`: the debounced "official" term used for fetching
  const [typedValue, setTypedValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Intersection Observer ref
  const observerRef = useRef<IntersectionObserver | null>(null);
  // Table scroll ref
  const scrollRef = useRef<HTMLTableElement | null>(null);

  /**
   * --------------------------------------
   *   Debounce with Lodash
   * --------------------------------------
   * We create a memoized debounced function that updates `searchTerm`
   * after 300ms of no further changes. Only the "trailing" call is used.
   */
  const debouncedUpdateSearchTerm = useMemo(
    () =>
      debounce(
        (value: string) => {
          setSearchTerm(value);
        },
        50,
        { leading: false, trailing: true }
      ),
    []
  );

  // Cleanup any pending debounced calls on unmount/re-render
  useEffect(() => {
    return () => {
      debouncedUpdateSearchTerm.cancel();
    };
  }, [debouncedUpdateSearchTerm]);

  /**
   * ---------------------------
   *       Effect: Reset
   * ---------------------------
   * Whenever the fully debounced `searchTerm` changes,
   * reset pagination and clear the list (so each new search starts fresh).
   */
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setAdvocates([]);
  }, [searchTerm]);

  /**
   * ---------------------------
   *     Fetch Advocates
   * ---------------------------
   * Paginated + search-based request, merging new data into `advocates`.
   */
  const fetchAdvocates = async () => {
    setIsLoading(true);
    try {
      const query = `/api/advocates?page=${
        searchTerm ? 1 : page
      }&limit=${limit}&search=${searchTerm}`;
      const res = await fetch(query);
      const json = await res.json();

      console.log("Fetched data:", json);

      // Append to existing array
      setAdvocates((prev) => [...prev, ...json.data]);

      // If we're on the last page, stop fetching
      if (json.pagination.page >= json.pagination.totalPages) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * ---------------------------
   *   Effect: Fetch on page or searchTerm change
   * ---------------------------
   */
  useEffect(() => {
    if (hasMore) {
      fetchAdvocates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm]);

  /**
   * ---------------------------
   *   Intersection Observer
   * ---------------------------
   * Increments `page` when sentinel is visible (infinite scroll).
   */
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      const firstEntry = entries[0];
      console.log("Intersection Observer:", firstEntry);
      if (firstEntry.isIntersecting && !isLoading && hasMore) {
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

  useEffect(() => {
    // detect if table is scrolling
    const table = scrollRef.current;
    if (!table) return;

    table.addEventListener("scroll", () => {
      setIsScrolling(true);
    });

    table.addEventListener("scrollend", () => {
      setIsScrolling(false);
    });

    return () => {
      table.removeEventListener("scroll", () => {
        setIsScrolling(false);
      });

      table.removeEventListener("scrollend", () => {
        setIsScrolling(false);
      });
    };
  }, []);

  /**
   * ---------------------------
   *   Handlers for Input
   * ---------------------------
   */
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Immediately update typedValue for the UI
    setTypedValue(val);
    // Trigger the debounced function, which will update searchTerm after 300ms
    debouncedUpdateSearchTerm(val);
  };

  const handleClearSearch = () => {
    setTypedValue("");
    setSearchTerm(""); // Force immediate reset
  };

  /**
   * ---------------------------
   *      Render
   * ---------------------------
   */
  return (
    <main className="h-screen p-4 pb-0 flex flex-col">
      <h1 className="text-2xl text-gray-800 font-semibold">Solace Advocates</h1>

      {/* Search Input */}
      <div className="my-4 flex items-center gap-2 relative focus-within:ring focus-within:ring-gray-400 rounded-lg max-w-4xl">
        <input
          className="flex-1 p-2 bg-gray-200 text-gray-800 placeholder-gray-400 rounded-lg focus:outline-none"
          placeholder="Search by name, city, degree or specialty"
          value={typedValue}
          onChange={handleSearchChange}
        />
        {!!typedValue && (
          <button
            onClick={handleClearSearch}
            className="px-4 py-2 absolute right-0 rounded-r-md text-gray-400 hover:text-gray-500 font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* Table Container */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-auto rounded-lg overflow-hidden no-scrollbar relative"
      >
        <table className="table-auto sm:table-fixed w-full border-collapse">
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

          <tbody>
            {advocates.map((advocate, index) => (
              <tr
                key={advocate.id}
                className={`${
                  index === 0 ? "" : "border-t-2"
                } hover:bg-gray-50 text-gray-500`}
              >
                <td className="px-4 py-2 align-top">
                  <HighlightedText
                    text={advocate.firstName}
                    query={typedValue}
                  />
                </td>
                <td className="px-4 py-2 align-top">
                  <HighlightedText
                    text={advocate.lastName}
                    query={typedValue}
                  />
                </td>
                <td className="px-4 py-2 align-top">
                  <HighlightedText text={advocate.city} query={typedValue} />
                </td>
                <td className="px-4 py-2 align-top">
                  <HighlightedText text={advocate.degree} query={typedValue} />
                </td>
                <td className="px-4 py-2 align-top">
                  {advocate.specialties?.map((spec, sIndex) => (
                    <li key={`${advocate.id}-spec-${sIndex}`}>
                      <HighlightedText text={spec} query={typedValue} />
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

        {/* Show "Scroll to load more" only if no active typedValue */}
        {!typedValue && !isScrolling && hasMore && (
          <div className="sticky inset-x-0 bottom-0 flex-1 text-center p-2 bg-white text-gray-400">
            Scroll to load more
          </div>
        )}

        {/* Sentinel for Intersection Observer */}
        <div id="sentinel" className="h-1"></div>
      </div>
    </main>
  );
}
