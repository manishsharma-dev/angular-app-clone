import { Component, OnInit } from "@angular/core";
import {  NgForm } from "@angular/forms";
import { AuthService } from "../auth.service";
import { FormBuilder } from '@angular/forms';
@Component({
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.css"]
})
export class SignupComponent implements OnInit { 
  isLoading = false;

  constructor(public authService: AuthService, private formBuilder: FormBuilder) {}


  ngOnInit(): void {
  
  }

  onSignup(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.authService.createUser(form.value.userName, form.value.password , form.value.confirmPassword);

    this.isLoading = true;
    //this.router.navigate(["./dashboard/endView"]);
    // this.authService.login('','');
  }


    
  

}
