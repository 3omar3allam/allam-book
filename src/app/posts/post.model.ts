export class Post {
  id: string;
  creator: {
    id: string,
    name: string,
  };
  date: Date;
  content: string;
  showContent: string;
  imagesPath: Array<string>;
  edited: boolean;
  dateDiff: string;
  showImage: boolean;
}
