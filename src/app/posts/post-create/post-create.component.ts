import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostService } from '../post.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../post.model';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { imageCompress } from './image.compress';

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
  imagePreview: string;
  imageFile: File;
  imageDelete: boolean;

  private authStatusSub: Subscription;
  private compressSub: Subscription;

  constructor(
    private postService: PostService,
    private route: ActivatedRoute,
    private auth: AuthService) { }

  ngOnInit() {
    this.authStatusSub = this.auth.getAuthStatus().subscribe(
      _=> {
        this.isLoading = false;
      }
    );
    setTimeout(()=>{
      document.getElementById('focus').focus();
    },500);
    this.form = new FormGroup({
      content: new FormControl(null, {
        validators: [Validators.required]
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
              imagePath: postData.imagePath,
              date: postData.date,
              edited: postData.edited,
              dateDiff: null,
              showContent: null,
              showImage: undefined,
            };
            this.form.patchValue({
              content: this.post.content,
            });
            if(this.post.imagePath){
              this.imagePreview = this.post.imagePath;
            }
          });
      } else{
        this.mode = mode.create;
        this.postId = null;
      }
    });
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
    if(this.compressSub)this.compressSub.unsubscribe();
  }

  onTextEntered(event:Event){
    const text = (event.target as HTMLInputElement).value;
    this.form.patchValue({content: text});
  }

  onSavePost(){
    if(this.form.invalid) return;
    if (this.mode == mode.create){
      this.postService.addPost(
        this.form.value.content,
        this.imageFile,
        new Date()
      );
    } else{
      this.postService.editPost(
        this.postId,
        this.form.value.content,
        this.imageFile,
        this.post,
        this.imageDelete
      );
    }
  }

  onImagePicked(event: Event){
    this.imageFile = (event.target as HTMLInputElement).files[0];
    this.form.updateValueAndValidity();
    if(!this.form.controls['image'].valid){
      this.form.patchValue({image:null});
      this.imagePreview = null;
      this.imageFile = null;
    }
    else{
      this.compressSub = imageCompress(this.imageFile).subscribe(
        compressedImage => {
          this.imageFile = compressedImage;
          const reader = new FileReader();
          reader.onload = () => {
            this.imagePreview = reader.result.toString();
          }
          reader.readAsDataURL(this.imageFile);
        },_=>{
          this.deleteImage();
        }
      )
    }
  }
  deleteImage(){
    this.imageDelete = true;
    this.imagePreview = null;
    this.form.patchValue({image:null});
    this.imageFile = null;
    if(this.post) this.post;
  }
}
