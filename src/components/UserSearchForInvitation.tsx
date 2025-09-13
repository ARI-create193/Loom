import React, { useState, useEffect } from 'react';
import { globalUserDatabase } from '../utils/globalUserDatabase';
import { useAuth } from '../contexts/AuthContext';

interface UserSearchForInvitationProps {
  onUserSelect: (user: { name: string; email: string; avatar: string }) => void;
  placeholder?: string;
}

interface SearchResult {
  name: string;
  email: string;
  avatar: string;
}

const UserSearchForInvitation: React.FC<UserSearchForInvitationProps> = ({
  onUserSelect,
  placeholder = "Search users by name or email..."
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { user } = useAuth();

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      if (user) {
        const results = globalUserDatabase.searchUsersForInvitation(searchQuery, user.email);
        const formattedResults: SearchResult[] = results.map(user => ({
          name: user.name,
          email: user.email,
          avatar: user.avatar
        }));
        setSearchResults(formattedResults);
        setShowResults(true);
      }
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, user]);

  const handleUserSelect = (selectedUser: SearchResult) => {
    onUserSelect(selectedUser);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding results to allow for click events
    setTimeout(() => setShowResults(false), 200);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {showResults && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((result, index) => (
            <div
              key={index}
              onClick={() => handleUserSelect(result)}
              className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {result.avatar}
                </div>
              </div>
              <div className="ml-3 flex-1">
                <div className="text-sm font-medium text-gray-900">{result.name}</div>
                <div className="text-sm text-gray-500">{result.email}</div>
              </div>
              <div className="flex-shrink-0">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {showResults && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-sm text-gray-500 text-center">
            No users found matching "{searchQuery}"
          </div>
        </div>
      )}

      {searchQuery.length > 0 && searchQuery.length < 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-sm text-gray-500 text-center">
            Type at least 2 characters to search
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSearchForInvitation;
