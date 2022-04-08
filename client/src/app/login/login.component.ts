import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {} from '@angular/forms';
import { AuthService } from '../helpers/auth.service';
import { SignRequest } from '../shared/siginRequest';

// https://blog.angular-university.io/angular-jwt-authentication/

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, public authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
  ngOnInit() {
    this.authService.resetAuthError();
  }
  onSubmit() {
    const signRequest = new SignRequest(
      this.loginForm.value.email,
      this.loginForm.value.password
    );
    this.authService.login(signRequest);
  }
}
