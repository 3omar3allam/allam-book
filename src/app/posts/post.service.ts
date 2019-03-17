import { Injectable } from '@angular/core';
import { Post } from './post.model';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';

const BACKEND_URL = environment.apiUrl + '/posts/';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private postsUpdated = new Subject<{posts: any, total: number}>();
  public refreshListener = new Subject<boolean>();

  constructor(
    private _http: HttpClient,
    private router: Router,
    private auth: AuthService  ) {}

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this._http
      .get<{
        message: string,
        posts: any,
        total: number,
      }>
      (BACKEND_URL + queryParams)
      .subscribe(data => {
        this.postsUpdated.next({posts: data.posts, total: data.total});
      });
  }
  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }
  addPost(content: string, image: File, date: Date) {
    const postData = new FormData();
    postData.append('content', content);
    postData.append('date', date.toJSON());
    let hasImage = 'false';
    if (image) {
      hasImage = 'true';
      const imageName = `${this.auth.getAuth().firstName} ${this.auth.getAuth().lastName} ${date.toJSON()}`;
      postData.append('image', image, imageName);
    }
    postData.append(hasImage, hasImage);
    this._http
      .post<{message: string, post: Post}>(
        BACKEND_URL,
        postData
      )
      .subscribe((response) => {
          this.router.navigate(['/']);
          this.auth.openSnackBar(response.message);
        });
  }

  deletePost(id: string) {
    return this._http.delete<{message: string}>
    (BACKEND_URL + id);
  }

  getPost(id: string) {
    return this._http.get<any>
    (BACKEND_URL + id);
  }
  editPost(userId: string, content: string, image: File, originalPost: Post, imageDelete: boolean) {
    if (originalPost.content === content) {
      if ( !image && (originalPost.imagesPath.length === 0 || (originalPost.imagesPath.length > 0 && !imageDelete)) ) {
        this.router.navigate(['/']);
        this.auth.openSnackBar('No changes occured');
        return;
      }
    }
    let postData: FormData;
    postData = new FormData();
    postData.append('content', content);
    let hasImage = 'false';
    if (image) {
      hasImage = 'true';
      const imageName = `${this.auth.getAuth().firstName} ${this.auth.getAuth().lastName} ${new Date().toJSON()}`;
      postData.append('image', image, imageName);
    }
    postData.append('hasImage', hasImage);
    this._http.put<any>
    (BACKEND_URL + userId, postData)
      .subscribe(response => {
        this.router.navigate(['/']);
        this.auth.openSnackBar(response.message);
      });
  }
}
