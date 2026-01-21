import { Link } from "react-router";

interface BreadcrumbProps {
  pageTitle: string;
  parentTitle?: string; // e.g., "Residents List"
  parentRoute?: string; // e.g., "/TailAdmin/residents"
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ 
  pageTitle, 
  parentTitle, 
  parentRoute 
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
        {pageTitle}
      </h2>
      <nav>
        <ol className="flex items-center gap-1.5">
          {/* 1. Home Link */}
          <li>
            <Link
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary"
              to="/TailAdmin/"
            >
              Home
              <ChevronIcon />
            </Link>
          </li>

          {/* 2. Middle Parent Link (Only shows if provided) */}
          {parentTitle && parentRoute && (
            <li>
              <Link
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary"
                to={parentRoute}
              >
                {parentTitle}
                <ChevronIcon />
              </Link>
            </li>
          )}

          {/* 3. Current Page Title */}
          <li className="text-sm text-gray-800 dark:text-white/90">
            {pageTitle}
          </li>
        </ol>
      </nav>
    </div>
  );
};

// Extracted the SVG to keep the code clean
const ChevronIcon = () => (
  <svg
    className="stroke-current"
    width="17"
    height="16"
    viewBox="0 0 17 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default PageBreadcrumb;