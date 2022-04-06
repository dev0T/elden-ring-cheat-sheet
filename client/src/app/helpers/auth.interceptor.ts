import {
  HttpRequest,
  HttpInterceptor,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const session = this.auth.getSession();
    
    if (session) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', 'Bearer ' + session),
      });

      return next.handle(cloned);
    } else {
      return next.handle(req);
    }
  }
}
