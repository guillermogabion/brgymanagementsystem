import { useState, useEffect } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useNavigate } from "react-router-dom"; 

interface User {
  username?: string;
  pic?: string;
  designation?: string;
}

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  

  // Helper to ensure Base64 is prefixed correctly
  const formatBase64 = (pic: string) => {
    if (!pic) return "";
    let cleanPic = pic.replace(/^"|"$/g, '');
    if (cleanPic.startsWith("data:image")) {
      return cleanPic;
    }


    // If it already has the data:image prefix, return it. 
    // Otherwise, assume it's a PNG/JPEG and add the prefix.
    return `data:image/png;base64,${cleanPic}`;
  };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem("token"); 
    localStorage.removeItem("user");
    closeDropdown();
    navigate("/signin");
  };

  useEffect(() => {

    console.log(localStorage.getItem("user"), "test")

    const loggedUser = localStorage.getItem("user");
    if (loggedUser) {
        setUser(JSON.parse(loggedUser));
    }
    
  }, []);

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400"
      >

        <span className="mr-3 overflow-hidden rounded-full h-11 w-11 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          {user?.pic ? (
            <img 
              src={formatBase64(user.pic)} 
              alt="User profile" 
              className="object-cover w-full h-full" 
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400 text-xs font-bold bg-gray-100 dark:bg-gray-800">
               {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
        </span>

        <span className="block mr-1 font-medium text-theme-sm">
          {user?.username || "User"}
        </span>

        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {user?.username}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {user?.designation || "Member"}
          </span>
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Edit profile
            </DropdownItem>
          </li>
        </ul>
        
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 w-full text-left"
        >
          {/* Logout Icon */}
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}