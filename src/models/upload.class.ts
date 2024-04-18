export class Upload {
  $key: string | undefined;
  file: File;
  name: string | undefined;
  url: string | undefined;
  createdAt: Date = new Date();

  constructor(file: File) {
    this.file = file;
  }
}
