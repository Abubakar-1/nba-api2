import { useEffect, useState } from "preact/hooks";
import { setInitialColor } from "@/utils/functions/string-functions";

interface AvatarProps {
  name: string;
  index: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-sm",
  md: "w-12 h-12 text-xl",
  lg: "w-16 h-16 text-2xl",
};

export function Avatar({
  name,
  index,
  size = "md",
  className = "",
}: AvatarProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Get initials from name
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join(" ");

  const colorClass = setInitialColor(index % 10);
  const sizeClass = sizeClasses[size];

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div
      className={`
        ${sizeClass} 
        ${colorClass} 
        ${className}
        text-white font-semibold rounded-full 
        inline-flex justify-center items-center
        transform transition-all duration-200
        ${isLoaded ? "scale-100 opacity-100" : "scale-95 opacity-0"}
      `}
    >
      {initials}
    </div>
  );
}
