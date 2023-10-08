import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CountryService } from 'src/app/shared/shareService/country-service.service';

import { AuthService } from '../auth.service';
import { AlphaNumericValidation, NamespecialValidation, PasswordValidation } from 'src/app/shared/utility/validation';
import { decryptText, encryptText } from 'src/app/shared/shareService/storageData';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  public loginForm: FormGroup;
  public isLoadingSpinner = false;
  private authStatusSub: Subscription;
  public hide: boolean = true;
  constructor(
    public authService: AuthService,
    private router: Router,
    private roleService: CountryService
  ) { }

  ngOnInit() {
    this.loginForm = new FormGroup({
      "userId": new FormControl('', [Validators.required]),
      "password": new FormControl('', [Validators.required]),
    })
    if (this.authService.getIsAuth()) {
      this.router.navigateByUrl('/dashboard')
    }
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((authStatus) => {
        this.isLoadingSpinner = false;
      });
  }

  onLogin() {
    if (this.loginForm.invalid) {
      return;
    }
    // const password = encryptText(this.loginForm.get('password').value.trim());
    // this.authService.login(this.loginForm.get('userId').value.trim(), password);
    //console.log(decryptText(password));
    this.authService.login(this.loginForm.get('userId').value.trim(),encryptText(this.loginForm.get('password').value.trim()));;
    this.isLoadingSpinner = true;
    this.loginForm.reset();

    // this.router.navigate(["./dashboard"]);
    // this.authService.login('','');
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
