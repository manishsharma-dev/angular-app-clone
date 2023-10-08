import { LocationStrategy } from '@angular/common';
import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { AuthService } from 'src/app/features/auth/auth.service';
import { AppService } from 'src/app/shared/shareService/app.service';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.css'],
})
export class PageNotFoundComponent implements OnInit {
  public errorMessage: string = '';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private locationStrategy: LocationStrategy
  ) {}

  ngOnInit(): void {
   // sessionStorage.clear();
    //this.errorMessage = this.route.snapshot.data['message'];
    this.route.data.subscribe((data: Data) => {
      this.errorMessage = data['message'];
    });
  }
}
