import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
import { User } from '../user.model';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {

  public userModel: User;
  public passwordNoMatch: boolean;
  isLoading= false;
  private authStatusSub: Subscription;
  constructor(private auth: AuthService) { }

  ngOnInit() {
    setTimeout(()=>{
      document.getElementById('focus').focus();
    },150);
    this.userModel = {
      firstName: "",
      lastName: "",
      email: "",
      password: ""
    };
    this.authStatusSub = this.auth.getAuthStatus().subscribe(
      _authStatus => {
        this.isLoading = false;
      }
    );
  }
  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }

  validatePassword(confirmPassword: string){
    if(confirmPassword != this.userModel.password){
      this.passwordNoMatch = true;
    }
    else{
      this.passwordNoMatch = false;
    }
  }

  onSignup(){
    this.isLoading = true;
    this.auth.createUser(this.userModel);
  }

}
