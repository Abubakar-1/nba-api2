import { useEffect, useRef, useState } from "preact/hooks";

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => JSX.Element;
  onEndReached?: () => void;
  endThreshold?: number;
  className?: string;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  onEndReached,
  endThreshold = 300,
  className = "",
}: VirtualizedListProps<T>) {
  const [isNearEnd, setIsNearEnd] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: `0px 0px ${endThreshold}px 0px`,
      threshold: 0.1,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const isIntersecting = entries[0]?.isIntersecting;
      if (isIntersecting && !isNearEnd) {
        setIsNearEnd(true);
        onEndReached?.();
      } else if (!isIntersecting && isNearEnd) {
        setIsNearEnd(false);
      }
    };

    if (containerRef.current) {
      observerRef.current = new IntersectionObserver(
        handleIntersection,
        options
      );
      observerRef.current.observe(containerRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [endThreshold, isNearEnd, onEndReached]);

  return (
    <div className={`overflow-auto ${className}`}>
      {items.map((item, index) => renderItem(item, index))}
      <div ref={containerRef} className="h-1" />
    </div>
  );
}
