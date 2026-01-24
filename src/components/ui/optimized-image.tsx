import { FunctionalComponent } from "preact";
import { useState, useEffect } from "preact/hooks";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  placeholder?: string;
}

/**
 * Optimized image component with lazy loading and blur-up placeholder
 * Improves performance by deferring offscreen images
 */
export const OptimizedImage: FunctionalComponent<OptimizedImageProps> = ({
  src,
  alt,
  className = "",
  width,
  height,
  loading = "lazy",
  placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3C/svg%3E",
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Use Intersection Observer for true lazy loading
    if (loading === "lazy" && "IntersectionObserver" in window) {
      const img = new Image();
      img.src = src;

      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };

      img.onerror = () => {
        setImageSrc(placeholder);
        setIsLoaded(true);
      };
    } else {
      setImageSrc(src);
      setIsLoaded(true);
    }
  }, [src, loading, placeholder]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={`${className} ${
        isLoaded ? "opacity-100" : "opacity-0"
      } transition-opacity duration-300`}
      loading={loading}
    />
  );
};
