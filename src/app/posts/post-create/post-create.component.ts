import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostService } from '../post.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../post.model';
import { mimeType } from './mime-type.validator';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { SafeResourceUrl } from '@angular/platform-browser';

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
  imagePreview: SafeResourceUrl= null

  private authStatusSub: Subscription;

  constructor(
    private postService: PostService,
    private route: ActivatedRoute,
    private auth: AuthService) { }

  ngOnInit() {
    this.authStatusSub = this.auth.getAuthStatus().subscribe(
      _authStatus=> {
        this.isLoading = false;
      }
    );
    setTimeout(()=>{
      document.getElementById('focus').focus();
    },150);
    this.form = new FormGroup({
      content: new FormControl(null, {
        validators: [Validators.required]
      }),
      image: new FormControl(null, {
        validators : null,
        asyncValidators: [mimeType],
      }),
    });
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
              image: postData.image,
              date: postData.date,
              edited: postData.edited,
              dateDiff: null,
              showContent: null,
              showImage: undefined,
            };
            this.form.patchValue({
              content: this.post.content,
            });
            if(this.post.image){
              this.post.image.path = this.postService.createImageUrl(this.post.image.type,this.post.image.binary);
              this.imagePreview = this.post.image.path;
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
  }

  onTextEntered(event:Event){
    const text = (event.target as HTMLInputElement).value;
    this.form.patchValue({content: text});
    this.form.updateValueAndValidity();
    if(this.form.invalid){
      console.log('invalid');
    }
  }

  onSavePost(){
    if (this.form.invalid) return;
    if (this.mode == mode.create){
      this.postService.addPost(
        this.form.value.content,
        this.form.value.image,
        new Date()
      );
    } else{
      this.postService.editPost(
        this.postId,
        this.form.value.content,
        this.form.value.image,
        this.post
      );
    }
  }

  onImagePicked(event: Event){
    console.log('picked');
    const file = (event.target as HTMLInputElement).files[0];
    this.form.get('image').updateValueAndValidity();
    if(!this.form.controls['image'].valid){
      console.log('invalid')
      this.form.patchValue({image:''});
      this.imagePreview = null;
    }
    else{
      console.log(this.form.controls['image'].valid);
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      }
      reader.readAsDataURL(file);
    }
  }
  deleteImage(){
    this.imagePreview = null;
    this.form.patchValue({image:null});
    if(this.post && this.post.image) this.post.image.path = null;
    (document.querySelector("input[type='file']") as HTMLInputElement).value = null;
  }
}
