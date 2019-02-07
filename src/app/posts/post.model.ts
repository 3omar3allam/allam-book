import { SafeResourceUrl } from "@angular/platform-browser";

export const enum imageType {
  'image/png',
  'image/jpg',
  'image/jpeg'
}

export class Post {
  id: string;
  creator: {
    id: string,
    name: string,
  };
  date: Date;
  content: string;
  showContent: string;
  image: {
    name: string,
    binary: string,
    type: imageType,
    path: SafeResourceUrl,
  };
  edited: boolean;
  dateDiff: string;
  showImage: boolean;
}
