import { cn } from "@/lib/utils";
import * as React from "react";

const Logo = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  ({ className, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("size-6", className)}
        {...props}
      >
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0" />
        <path d="M12 9v1" />
        <path d="M12 14v1" />
      </svg>
    );
  }
);
Logo.displayName = "Logo";

export default Logo;
