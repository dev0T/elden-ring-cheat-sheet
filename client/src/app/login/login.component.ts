import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
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

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
  ngOnInit() {}
  onSubmit() {
    const signRequest = new SignRequest(
      this.loginForm.value.email,
      this.loginForm.value.password
    );
    this.authService.login(signRequest);
  }
}
