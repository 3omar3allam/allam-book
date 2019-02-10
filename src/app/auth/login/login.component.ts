import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  isLoading= false;
  private authStatusSub: Subscription;

  constructor(private auth: AuthService) {}

  ngOnInit() {
    setTimeout(()=> document.getElementById('focus').focus(), 150);
    this.authStatusSub = this.auth.getAuthStatus().subscribe(
      _authStatus => {
        this.isLoading = false;
      }
    );
  }
  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
  onLogin(form: NgForm){
    if(form.invalid) return;
    this.isLoading = true;
    this.auth.login(form.value.email,form.value.password);
  }

}
