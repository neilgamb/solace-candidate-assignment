"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [advocates, setAdvocates] = useState([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    console.log("fetching advocates...");

    fetch("/api/advocates")
      .then((response) => response.json())
      .then((jsonResponse) => {
        setAdvocates(jsonResponse.data);
        setFilteredAdvocates(jsonResponse.data);
      })
      .catch((err) => {
        console.error("Error fetching advocates:", err);
      });
  }, []);

  const onChange = (e) => {
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
      const matchesSpecialties = specialties?.some((spec) =>
        spec.toLowerCase().includes(lowerInput)
      );
      const matchesYearsOfExperience = yearsOfExperience
        ?.toString()
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
          Searching for: <span id="search-term"></span>
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
          {filteredAdvocates.map((advocate, index) => {
            return (
              <tr key={index}>
                <td>{advocate.firstName}</td>
                <td>{advocate.lastName}</td>
                <td>{advocate.city}</td>
                <td>{advocate.degree}</td>
                <td>
                  {advocate.specialties.map((s, index) => (
                    <div key={index}>{s}</div>
                  ))}
                </td>
                <td>{advocate.yearsOfExperience}</td>
                <td>{advocate.phoneNumber}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
