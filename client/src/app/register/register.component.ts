import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../helpers/auth.service';
import { SignRequest } from '../shared/siginRequest';

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, public authService: AuthService) {
    this.registerForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.authService.resetAuthError();
  }

  onSubmit() {
    const signRequest = new SignRequest(
      this.registerForm.value.email,
      this.registerForm.value.password
    );
    this.authService.register(signRequest);
  }
}
