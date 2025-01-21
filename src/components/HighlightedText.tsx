import { ReactNode } from "react";

interface HighlightedTextProps {
  text: string;
  query: string;
}

export default function HighlightedText({
  text,
  query,
}: HighlightedTextProps): ReactNode {
  if (!query) return text;

  // Build a case-insensitive regex from the query
  const regex = new RegExp(`(${query})`, "gi");

  // Split the text with capturing groups so that the matched text remains in the array
  const parts = text.split(regex);

  return parts.map((part, i) => {
    // If the current part of the string matches the query, wrap it with a highlight
    if (part.toLowerCase() === query.toLowerCase()) {
      return (
        <mark key={i} className="bg-yellow-200">
          {part}
        </mark>
      );
    } else {
      // Otherwise just return the text as is
      return part;
    }
  });
}
