import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useEffect, useMemo } from "preact/hooks";
import { Table, TableBody, TableRow, TableCell } from "./table";

interface VirtualizedTableProps<T> {
  data: T[];
  rowHeight?: number;
  renderRow: (item: T, index: number) => React.ReactNode;
}

export function VirtualizedTable<T>({
  data,
  rowHeight = 60,
  renderRow,
}: VirtualizedTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  return (
    <div ref={parentRef} className="max-h-[600px] overflow-auto">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualRows.map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {renderRow(data[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
