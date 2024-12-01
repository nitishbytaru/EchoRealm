// hooks/useDebouncedSearchResults.js
import { useState, useEffect } from "react";
import { searchUsersApi } from "../api/user.api.js";

export function useDebouncedSearchResults(query) {
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query) {
        const response = await searchUsersApi(query);
        setSearchResults(response?.data?.searchedUsersWithFriends || []);
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return searchResults;
}
