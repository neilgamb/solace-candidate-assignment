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
  const regex = new RegExp(`(${query})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) => {
    if (part.toLowerCase() === query.toLowerCase()) {
      return (
        <mark key={i} className="bg-yellow-200">
          {part}
        </mark>
      );
    } else {
      return part;
    }
  });
}
