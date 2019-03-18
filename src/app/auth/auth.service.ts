import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

import { User } from './user.model';
import { environment } from '../../environments/environment';
import { MatSnackBar } from '@angular/material';

export const BACKEND_URL = environment.apiUrl + '/auth/';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string;
  private authenticated = false;
  private authStatusListener = new Subject<boolean>();
  private loggedUserListener = new Subject<{id: string, firstName: string, lastName: string}>();
  private refreshListener = new Subject<boolean>();
  private timeout: any;
  private userId: string;
  private userFirstName: string;
  private userLastName: string;

  constructor(
    private _http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  getToken() {
    return this.token;
  }

  isAuthenticated() {
    return this.authenticated;
  }

  getAuth() {
    const authdata = this.getAuthData();
    return{
      id: authdata.userId,
      firstName: authdata.firstName,
      lastName: authdata.lastName,
    };
  }

  getAuthStatus() {
    return this.authStatusListener.asObservable();
  }

  getLoggedUserListener() {
    return this.loggedUserListener.asObservable();
  }

  createUser(userModel: User) {

    const user: User = {
      firstName: userModel.firstName,
      lastName: userModel.lastName,
      email: userModel.email,
      password: userModel.password,
    };
    return this._http.post<any>
    (BACKEND_URL + 'register/', user)
    .subscribe(() => {
      this.login(user.email, user.password);
    }, _ => {
      this.authStatusListener.next(false);
      this.loggedUserListener.next({id: null, firstName: null, lastName: null});
    });
  }

  login(email: string, password: string) {
    const loginData = {
      email: email, password: password,
    };
    this._http.post<any>
    (BACKEND_URL, loginData)
      .subscribe(response => {
        this.token = response.token;
        if (this.token) {
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration);
          this.authenticated = true;
          this.authStatusListener.next(true);
          this.userId = response.userId;
          this.userFirstName = response.fname;
          this.userLastName = response.lname;
          this.loggedUserListener.next({
            id: this.userId,
            firstName: this.userFirstName,
            lastName: this.userLastName,
          });
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
          this.saveAuthData(this.token, expirationDate, this.userId, this.userFirstName, this.userLastName);
          this.router.navigate(['/']);
          this.openSnackBar(response.message);
        }
      }, _ => {
        this.authStatusListener.next(false);
        this.loggedUserListener.next({id: null, firstName: null, lastName: null});
      });
  }
  logout() {
    this.token = null;
    this.authenticated = false;
    this.authStatusListener.next(false);
    this.loggedUserListener.next({id: null, firstName: null, lastName: null});
    this.userId = null;
    this.userFirstName = null;
    this.userLastName = null;
    clearTimeout(this.timeout);
    this.clearAuthData();
    this.refresh();
    this.openSnackBar('Logged Out');
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) { return; }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.authenticated = true;
      this.userId = authInformation.userId;
      this.userFirstName = authInformation.firstName;
      this.userLastName = authInformation.lastName;
      this.authStatusListener.next(true);
      this.loggedUserListener.next({
        id: this.userId,
        firstName: this.userFirstName,
        lastName: this.userLastName,
      });
      this.setAuthTimer(expiresIn / 1000);
    }
  }

  private setAuthTimer(duration: number) {
    this.timeout = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string, fname: string, lname: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
    localStorage.setItem('firstName', fname);
    localStorage.setItem('lastName', lname);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    const fname = localStorage.getItem('firstName');
    const lname = localStorage.getItem('lastName');
    if (!token || !expirationDate) {
      return ;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId,
      firstName: fname,
      lastName: lname
    };
  }

  getRefreshListener() {
    return this.refreshListener.asObservable();
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, '', {
      duration: 2000,
    });
  }

  refresh() {
    if (this.router.url === '/') {
      this.refreshListener.next(true);
    } else {
      this.router.navigate(['/']);
    }
  }

}
