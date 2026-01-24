declare module "xlsx" {
  export function write(
    wb: XLSX.WorkBook,
    options?: XLSX.WritingOptions
  ): string;

  export interface WorkBook {
    SheetNames: string[];
    Sheets: { [sheetName: string]: WorkSheet };
  }

  export interface WorkSheet {}

  export interface WritingOptions {
    bookType?: string;
    type?: "array" | "binary" | "string" | "buffer" | "base64" | "file";
    mimeType?: string;
    compression?: boolean;
  }

  export const utils: {
    json_to_sheet(data: any[], opts?: any): WorkSheet;
    book_new(): WorkBook;
    book_append_sheet(wb: WorkBook, ws: WorkSheet, name?: string): void;
  };
}
