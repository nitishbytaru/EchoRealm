import { useState, useEffect } from "react";
import { searchUsersApi } from "@/api/user.api";

export function useDebouncedSearchResults(query: string) {
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query) {
        try {
          const response = await searchUsersApi(query);
          setSearchResults(response?.data?.searchedUsersWithFriends || []);
        } catch (error) {
          console.error("Search API failed:", error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return searchResults;
}
