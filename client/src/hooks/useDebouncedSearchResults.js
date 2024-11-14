// hooks/useDebouncedSearchResults.js
import { useState, useEffect } from "react";
import { searchUsers } from "../api/echoWhisperApi";

export function useDebouncedSearchResults(query) {
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query) {
        searchUsers(query)
          .then((users) => setSearchResults(users))
          .catch((err) => console.error(err));
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return searchResults;
}
