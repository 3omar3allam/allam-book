export class Post {
  id: string;
  creator: {
    id: string,
    name: string,
  };
  date: Date;
  content: string;
  showContent: string;
  imagePath: string;
  edited: boolean;
  dateDiff: string;
  showImage: boolean;
}
