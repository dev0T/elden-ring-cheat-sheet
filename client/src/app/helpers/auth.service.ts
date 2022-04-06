import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { User } from '../shared/user';
import { environment } from '../../environments/environment';
import { SignRequest } from '../shared/siginRequest';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private API_URL = environment.API_URL;
  endpoint: string = this.API_URL;
  currentUser?: User;
  helper = new JwtHelperService();

  constructor(private http: HttpClient, public router: Router) {}

  login(signRequest: SignRequest) {
    return this.http
      .post<SignRequest>(`${this.endpoint}/api/login`, signRequest)
      .pipe(shareReplay())
      .subscribe((res: any) => {
        this.setSession(res.user_identity);
        this.getUserProfiles().subscribe((res) => {
          this.currentUser = res;
          this.router.navigateByUrl('/');
        });
      });
  }

  getCurrentUser() {
    return this.currentUser;
  }

  register(signRequest: SignRequest): Observable<any> {
    let api = `${this.endpoint}/api/register`;
    return this.http.post(api, signRequest).pipe(catchError(this.handleError));
  }

  private setSession(token: string) {
    localStorage.setItem('access_token', token);
  }

  getSession() {
    if (this.isLoggedIn()) {
      return localStorage.getItem('access_token');
    } else {
      return null;
    }
  }

  logOut() {
    localStorage.removeItem('access_token');
    if (localStorage.getItem('access_token') == null) {
      this.router.navigate(['login']);
    }
  }

  isLoggedIn() {
    if (localStorage.getItem('access_token') == null) {
      return false;
    }
    return this.isTokenStillValid();
  }

  isTokenStillValid() {
    return this.helper.isTokenExpired();
  }

  isLoggedOut() {
    return !this.isLoggedIn();
  }

  getUserProfiles(): Observable<any> {
    let api = `${this.endpoint}/api/user`;
    return this.http.get(api).pipe(
      map((res) => {
        return res || {};
      }),
      catchError(this.handleError)
    );
  }

  handleError(error: HttpErrorResponse) {
    let msg = '';
    if (error.error instanceof ErrorEvent) {
      // client-side error
      msg = error.error.message;
    } else {
      // server-side error
      msg = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(msg));
  }
}
