import classNames from "classnames";
import { memo } from "preact/compat";

interface PageLoaderProps {
  isOutlined?: boolean;
  size?: "sm" | "md" | "lg";
}

const PageLoader = memo(({ isOutlined, size = "md" }: PageLoaderProps) => {
  const sizeClasses = {
    sm: "h-[24px] w-[24px]",
    md: "h-[32px] w-[32px]",
    lg: "h-[40px] w-[40px]",
  };

  return (
    <svg
      className={classNames(
        "animate-[spin_1s_cubic-bezier(0.45,0,0.55,1)_infinite] transition-all duration-300",
        sizeClasses[size],
        {
          "text-white/90 drop-shadow-[0_0_8px_rgba(255,255,255,0.25)]":
            !isOutlined,
          "text-primary-600 drop-shadow-[0_0_8px_rgba(59,130,246,0.15)]":
            isOutlined,
        }
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-15"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth={2}
      ></circle>
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
});

export default PageLoader;
