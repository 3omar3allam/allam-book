import { Injectable } from '@angular/core';
import { Post, imageType } from './post.model';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

import { environment } from "../../environments/environment";
import { AuthService } from '../auth/auth.service';

const BACKEND_URL = environment.apiUrl + "/posts/";

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private postsUpdated = new Subject<{posts: any,total:number}>();
  public refreshListener = new Subject<boolean>();

  constructor(
    private _http: HttpClient,
    private router:Router,
    private auth: AuthService  ){}

  getPosts(postsPerPage:number, currentPage:number){
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this._http
      .get<{
        message:string,
        posts: any,
        total:number,
      }>
      (BACKEND_URL + queryParams)
      .subscribe(data => {
        this.postsUpdated.next({posts: data.posts, total: data.total});
      });
  }
  getPostUpdateListener(){
    return this.postsUpdated.asObservable();
  }
  addPost(content:string, image: File, date: Date){
    const postData = new FormData();
    postData.append('content',content);
    postData.append('date', date.toJSON());
    if(image){
      let imageName = `${this.auth.getAuth().firstName}-${this.auth.getAuth().lastName}-${date.toJSON()}`.toLowerCase();
      postData.append('image', image, imageName);
    }
    this._http
      .post<{message: string,post: Post}>(
        BACKEND_URL,
        postData
      )
      .subscribe((response) => {
          this.router.navigate(['/']);
          this.auth.openSnackBar(response.message);
        });
  }

  deletePost(id: string){
    return this._http.delete<{message: string}>
    (BACKEND_URL + id);
  }

  getPost(id:string){
    return this._http.get<any>
    (BACKEND_URL + id);
  }
  editPost(userId:string, content:string, image: File, originalPost: Post){
    if(originalPost.content == content){
      if( (!image && !originalPost.image) || (!image && originalPost.image.path) )
      {
        this.router.navigate(['/']);
        this.auth.openSnackBar("No changes occured");
        return;
      }
    }
    let postData: FormData;
    postData = new FormData();
    postData.append('content',content);
    if(image){
      let imageName = `${this.auth.getAuth().firstName}-${this.auth.getAuth().lastName}-${new Date().toJSON()}`.toLowerCase();
      postData.append('image',image, imageName);
    }

    this._http.put<any>
    (BACKEND_URL + userId, postData)
      .subscribe(response => {
        this.router.navigate(['/']);
        this.auth.openSnackBar(response.message);
      });
  }

  createImageUrl(type:imageType, binary: string){
    return `data:${type};base64,${binary}`;
  }

  // dataURLtoFile(dataurl, filename) {
  //   let start = dataurl.indexOf('data:');
  //   dataurl = dataurl.substring(start);
  //   let arr = dataurl.split(',');
  //   let mime = arr[0].match(/:(.*?);/)[1];
  //   let bstr = atob(arr[1]);
  //   let n = bstr.length, u8arr = new Uint8Array(n);
  //   while(n--){
  //       u8arr[n] = bstr.charCodeAt(n);
  //   }
  //   return new File([u8arr], filename, {type:mime});
  // }

}
