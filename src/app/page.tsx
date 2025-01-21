"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import HighlightedText from "@/components/HighlightedText";

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    console.log("fetching advocates...");
    fetch("/api/advocates")
      .then((response) => response.json())
      .then((jsonResponse: ApiResponse) => {
        setAdvocates(jsonResponse.data);
        setFilteredAdvocates(jsonResponse.data);
      })
      .catch((err) => {
        console.error("Error fetching advocates:", err);
      });
  }, []);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setSearchTerm(inputValue);

    const filtered = advocates.filter((advocate) => {
      const { firstName, lastName, city, degree, specialties } = advocate;
      const lowerInput = inputValue.toLowerCase();
      const matchesFirstName = firstName?.toLowerCase().includes(lowerInput);
      const matchesLastName = lastName?.toLowerCase().includes(lowerInput);
      const matchesCity = city?.toLowerCase().includes(lowerInput);
      const matchesDegree = degree?.toLowerCase().includes(lowerInput);
      const matchesSpecialties = specialties.some((spec) =>
        spec.toLowerCase().includes(lowerInput)
      );

      return (
        matchesFirstName ||
        matchesLastName ||
        matchesCity ||
        matchesDegree ||
        matchesSpecialties
      );
    });

    setFilteredAdvocates(filtered);
  };

  const onClick = () => {
    console.log("Resetting search...");
    setSearchTerm("");
    setFilteredAdvocates(advocates);
  };

  const formatPhoneNumber = (num: number): string => {
    const phoneString = num.toString();
    const parsed = parsePhoneNumberFromString(phoneString, "US");
    if (parsed) {
      return parsed.formatNational();
    }
    return phoneString;
  };

  return (
    <main className="h-screen p-4 flex flex-col">
      <h1 className="text-2xl text-gray-800 font-semibold">Solace Advocates</h1>
      <div className="my-4 flex items-center gap-2 relative focus-within:ring focus-within:ring-gray-400 rounded-lg max-w-4xl">
        <input
          className="flex-1 p-2 bg-gray-200 text-gray-800 placeholder-gray-400 rounded-lg focus:outline-none"
          onChange={onChange}
          value={searchTerm}
          placeholder="Search by name, city, degree or specialty"
        />
        {searchTerm && (
          <button
            onClick={onClick}
            className="px-4 py-2 transition-colors absolute right-0 rounded-r-md text-gray-400 hover:text-gray-500 font-bold"
          >
            ✕
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-auto rounded-lg overflow-hidden no-scrollbar">
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
            {filteredAdvocates.map((advocate, index) => (
              <tr
                key={advocate.id}
                className={`${
                  index === 0 ? "" : "border-t-2"
                } hover:bg-gray-50 hover:curor-pointer text-gray-500`}
              >
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
                  {Array.isArray(advocate.specialties) &&
                    advocate.specialties.map((s, sIndex) => (
                      <li key={`${advocate.id}-specialty-${sIndex}`}>
                        <HighlightedText text={s} query={searchTerm} />
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
      </div>
    </main>
  );
}
