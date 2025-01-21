"use client";

import { useEffect, useState, ChangeEvent } from "react";

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
      const {
        firstName,
        lastName,
        city,
        degree,
        specialties,
        yearsOfExperience,
      } = advocate;
      const lowerInput = inputValue.toLowerCase();
      const matchesFirstName = firstName?.toLowerCase().includes(lowerInput);
      const matchesLastName = lastName?.toLowerCase().includes(lowerInput);
      const matchesCity = city?.toLowerCase().includes(lowerInput);
      const matchesDegree = degree?.toLowerCase().includes(lowerInput);
      const matchesSpecialties = specialties.some((spec) =>
        spec.toLowerCase().includes(lowerInput)
      );
      const matchesYearsOfExperience = yearsOfExperience
        .toString()
        .includes(lowerInput);

      return (
        matchesFirstName ||
        matchesLastName ||
        matchesCity ||
        matchesDegree ||
        matchesSpecialties ||
        matchesYearsOfExperience
      );
    });

    setFilteredAdvocates(filtered);
  };

  const onClick = () => {
    console.log("Resetting search...");
    setSearchTerm("");
    setFilteredAdvocates(advocates);
  };

  return (
    <main style={{ margin: "24px" }}>
      <h1>Solace Advocates</h1>
      <br />
      <br />
      <div>
        <p>Search</p>
        <p>
          Searching for: <span id="search-term">{searchTerm}</span>
        </p>
        <input
          style={{ border: "1px solid black" }}
          onChange={onChange}
          value={searchTerm}
        />
        <button onClick={onClick}>Reset Search</button>
      </div>
      <br />
      <br />
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>City</th>
            <th>Degree</th>
            <th>Specialties</th>
            <th>Years of Experience</th>
            <th>Phone Number</th>
          </tr>
        </thead>
        <tbody>
          {filteredAdvocates.map((advocate, index) => (
            <tr key={index}>
              <td>{advocate.firstName}</td>
              <td>{advocate.lastName}</td>
              <td>{advocate.city}</td>
              <td>{advocate.degree}</td>
              <td>
                {advocate.specialties.map((specialty, i) => (
                  <div key={i}>{specialty}</div>
                ))}
              </td>
              <td>{advocate.yearsOfExperience}</td>
              <td>{advocate.phoneNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
