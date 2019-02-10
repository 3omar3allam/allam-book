import { Component, OnInit, HostListener } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { LocationStrategy } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'allambook';

  constructor(
    private auth: AuthService,
    private location: LocationStrategy
  ){}

  ngOnInit(){
    this.auth.autoAuthUser();
  }

  @HostListener('window:beforeunload')
  handleBack() {
    this.location.back();
  }
}
