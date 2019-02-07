import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription, Observable } from 'rxjs';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input()title;

  private authListenerSubs: Subscription;
  private loggedUserListenerSubs: Subscription;
  authenticated: boolean = false;
  username: string = "";

  private layoutChanges = new Observable<BreakpointState>();
  mobileView: boolean = false;
  scrolled: boolean = false;

  constructor(private auth: AuthService, private breakpointObserver: BreakpointObserver) {}

  ngOnInit() {
    this.mobileView = this.breakpointObserver.isMatched('(max-width: 768px)');

    this.layoutChanges = this.breakpointObserver.observe('(max-width: 768px)');

    this.layoutChanges.subscribe(result=> {
      this.mobileView = result.matches;
    })

    window.addEventListener('scroll', () => {
      if(window.scrollY > 50){
        this.scrolled = true;
      }else{
        this.scrolled = false;
      }
    });

    this.authenticated = this.auth.isAuthenticated();
    if(this.authenticated){
      this.username = `${this.auth.getAuth().firstName} ${this.auth.getAuth().lastName}`;
    }

    this.authListenerSubs = this.auth.getAuthStatus()
      .subscribe(isAuthenticated => {
        this.authenticated = isAuthenticated;
      });
    this.loggedUserListenerSubs = this.auth.getLoggedUserListener()
      .subscribe(loggedUser => {
        if(loggedUser.firstName && loggedUser.lastName){
          this.username = `${loggedUser.firstName} ${loggedUser.lastName}`;
        }
      });
  }

  ngOnDestroy(){
    this.authListenerSubs.unsubscribe();
    this.loggedUserListenerSubs.unsubscribe();
  }

  onLogout(){
    this.authenticated = false;
    this.username = null;
    this.auth.logout();
  }

  refresh(){
    this.auth.refresh();
  }

}
