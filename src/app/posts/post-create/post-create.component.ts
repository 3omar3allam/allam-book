import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { PostService } from '../post.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Post } from '../post.model';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { imageCompress } from './image.compress';
import { whiteSpaceValidator } from './whitespace.validator';

const enum mode  {
  create=0,
  edit=1,
};

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit, OnDestroy {

  form: FormGroup;
  private mode = mode.create;
  private postId: string;
  public post: Post;
  isLoading = false;
  imagePreview= new Array<string>();
  imageFile: File;
  imageDelete: boolean;
  imageError: boolean;

  private authStatusSub: Subscription;
  private compressSub: Subscription;

  constructor(
    private postService: PostService,
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.authStatusSub = this.auth.getAuthStatus().subscribe(
      _=> {
        this.isLoading = false;
      }
    );
    this.form = new FormGroup({
      content: new FormControl(null, {
        validators: [whiteSpaceValidator],
      }),
      image: new FormControl(null, {
        validators : null
      }),
    });
    this.imageFile = null;
    this.imageDelete = false;
    this.route.paramMap.subscribe((paramMap:ParamMap) => {
      if(paramMap.has('id')){
        this.mode = mode.edit;
        this.postId = paramMap.get('id');
        this.isLoading = true;
        this.postService.getPost(this.postId)
          .subscribe(postData => {
            this.isLoading = false;
            this.post = {
              id: postData._id,
              creator: postData.creator,
              content: postData.content,
              imagesPath: postData.imagesPath,
              date: postData.date,
              edited: postData.edited,
              dateDiff: null,
              showContent: null,
              showImage: undefined,
            };
            this.form.patchValue({
              content: this.post.content,
            });
            if(this.post.imagesPath.length > 0){
              this.imagePreview = this.post.imagesPath;
              this.form.get('content').clearValidators();
              this.form.get('content').updateValueAndValidity();
            }
            setTimeout(()=> {
              document.getElementById('focus').focus();
            }, 250);
          });
      } else{
        this.mode = mode.create;
        this.postId = null;
        setTimeout(()=> {
          document.getElementById('focus').focus();
        }, 150);
      }
    });
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
    if(this.compressSub)this.compressSub.unsubscribe();
  }

  onSavePost(){
    if(this.form.invalid) return;
    let content = (this.form.get('content').value);
    if(content == null) content = "";
    if (this.mode == mode.create){
      this.postService.addPost(
        content.trim(),
        this.imageFile,
        new Date()
      );
    } else{
      this.postService.editPost(
        this.postId,
        content.trim(),
        this.imageFile,
        this.post,
        this.imageDelete
      );
    }
    this.isLoading = true;
  }

  onImagePicked(event: Event){
    this.imageFile = (event.target as HTMLInputElement).files[0];
    this.compressSub = imageCompress(this.imageFile).subscribe(
      ({file,preview}) => {
        this.form.get('content').clearValidators();
        this.form.get('content').updateValueAndValidity();
        this.imageError = false;
        this.imageFile = file;
        this.imagePreview = [preview];
      },_error=>{
        this.imageError = true;
        this.deleteImage();
      });
  }
  deleteImage(){
    this.form.get('content').setValidators(whiteSpaceValidator);
    this.form.get('content').updateValueAndValidity();
    this.imageDelete = true;
    this.imagePreview.pop();
    this.form.patchValue({image:null});
    this.imageFile = null;
  }

  deletePost(){
    this.isLoading = true;
    this.postService.deletePost(this.postId).subscribe(response=>{
      this.router.navigate(['']);
      this.auth.openSnackBar(response.message);
    },_error=>{
      this.isLoading = false;
    });
  }

}
