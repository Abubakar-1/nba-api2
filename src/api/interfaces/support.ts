export interface ISupportRequest {
  // files: File | null;
  files: FileList | null;
  issue: string;
  message: string;
  sender_name: string;
  sender_email: string;
}
