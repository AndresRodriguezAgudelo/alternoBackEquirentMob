export interface IPrivateFile {
  contentType: string;
  contentLength: number;
  eTag: string;
  fileBuffer: Buffer;
}
