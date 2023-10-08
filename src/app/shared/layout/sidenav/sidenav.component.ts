import { OwnerDetailsService } from './../../../features/animal-management/owner-registration/owner-details.service';
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewEncapsulation,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { Router, ROUTES } from '@angular/router';
import { AuthService } from 'src/app/features/auth/auth.service';

import { AccessManagementService } from 'src/app/features/admin-management/access-management/access-management.service';
import {
  getSessionData,
  setEncryptedData,
  setSessionData,
} from '../../shareService/storageData';
import { DashBoardService } from 'src/app/features/dashboard/dashboard.service';
import { DashboardLayoutService } from '../dashboard-layout/dashboard-layout.service';
import { TranslateService } from '@ngx-translate/core';
import { distinctUntilChanged, take } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class SidenavComponent implements OnInit, AfterViewInit, OnDestroy {
  languageSubscription!: Subscription;
  @Output() public sideNavClosed = new EventEmitter();
  toggle: any;
  hide: any;
  public role: string;
  public role2: string;
  isExpanded = true;
  showSubmenu: boolean = false;
  showSubmenu1: boolean = false;
  isShowing = false;
  showSubSubMenu: boolean = false;
  assignRoles = [];
  rolesDefault = [];
  getDefaultRole: [] = [];
  isLoadingSpinner = false;

  constructor(
    private authService: AuthService,
    private route: Router,
    private ownerDS: OwnerDetailsService,
    private adminSrv: DashBoardService,
    private rollSrv: AccessManagementService,
    private dashboardService: DashboardLayoutService,
    private translate: TranslateService
  ) {}
  ngOnDestroy(): void {
    this.languageSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.dropdownToggle();
    this.sideCloseNavcollapse();
    this.defaultRole();
    this.hasRole();
    this.onLanChnage();
    // this.translate.onLangChange.subscribe((lang) => {
    //   this.authService.getSidenavLabels().subscribe((labels) => {
    //     this.defaultRole();
    //   })
    // })
    this.languageSubscription = this.dashboardService
      .getlangauge()
      .pipe(
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        )
      )
      .subscribe((lang) => {
        if (this.authService.getToken()) {
          this.authService.getSidenavLabels().subscribe((labels) => {
            this.assignRoles = this.assignRoles.map((role) => ({ ...role }));
          });
        }
      });
  }
  onLanChnage() {
    //this.dashboardService.getLabelByLanguageCd().subscribe((data) => { });
  }

  onSideNavClosed(nav, childNav?): void {
    this.sideNavClosed.emit();
    this.ownerDS.refreshOwnerDetails();
    //sessionStorage.clear();
    // const storageData = {
    //   moduleCd : nav?.moduleCd,
    //   subModuleCd: childNav?.subModuleCd
    // }
    // setSessionData(storageData, "subModuleCd")
  }

  // onSideNavClosed(nav?){
  //   this.sideNavClosed.emit();
  //   this.ownerDS.refreshOwnerDetails();
  // }

  defaultRole() {
    this.getDefaultRole = JSON.parse(
      sessionStorage.getItem('user')
    )?.defaultRoleAccess;
    if (this.getDefaultRole) {
      this.setSideBar(this.getDefaultRole['modules']);
    }
  }

  setSideBar(modules) {
    this.assignRoles = [];
    for (let getRole of modules) {
      this.assignRoles.push(getRole);
    }
  }

  hasRole() {
    this.adminSrv.refreshNeeded.subscribe((respone: any) => {
      this.assignRoles = [];
      let isDefaultRole = respone.split('-')[0];
      let role = JSON.parse(sessionStorage.getItem('user')).defaultRoleAccess[
        'roleCd'
      ];
      if (isDefaultRole == role) {
        this.defaultRole();
      } else {
        let additionalRole = JSON.parse(
          sessionStorage.getItem('user')
        )?.additionalRoleAccess;
        for (let getRole of additionalRole) {
          if (
            getRole['modules'].length > 0 &&
            getRole.roleCd == isDefaultRole
          ) {
            this.assignRoles = [];
            for (let getAddiotionalRole of getRole['modules']) {
              this.assignRoles.push(getAddiotionalRole);
            }
          }
        }
      }
    });
  }

  highlightSelectedTab(value?: number) {
    const childItems: any = document.getElementsByClassName('owner-reg');
    if (value != undefined) {
      for (let i = 0; i < childItems.length; i++) {
        if (i == value) {
          childItems[i].classList.add('mat-accent-child');
        } else {
          childItems[i].classList.remove('mat-accent-child');
        }
      }
    } else {
      for (let i = 0; i < childItems.length; i++) {
        childItems[i].classList.remove('mat-accent-child');
      }
    }
  }

  animalManagementRedirections(value: number) {
    this.ownerDS.refreshOwnerDetails();
    switch (value) {
      case 1:
        this.route.navigateByUrl('/dashboard/owner/ownersearch');
        this.highlightSelectedTab(value - 1);
        break;

      case 2:
        this.route.navigateByUrl('/dashboard/animal/animalsearch');
        this.highlightSelectedTab(value - 1);
        break;

      case 3:
        this.route.navigateByUrl('/dashboard/owner/ownertransfer');
        this.highlightSelectedTab(value - 1);
        break;

      case 4:
        this.route.navigateByUrl('/dashboard/animal/eartagchange');
        this.highlightSelectedTab(value - 1);
        break;

      case 5:
        this.route.navigateByUrl('/dashboard/owner/modifyowner');
        this.highlightSelectedTab(value - 1);
        break;

      case 6:
        this.route.navigateByUrl('/dashboard/animal/modifyanimal');
        this.highlightSelectedTab(value - 1);
        break;

      case 7:
        this.route.navigateByUrl('/dashboard/owner/ownersearchinvillage');
        this.highlightSelectedTab(value - 1);
        break;
    }
  }

  dropdownToggle(): void {
    let dropdownToggleIcon: HTMLElement =
      document.getElementById('dropdownToggleIcon');
    let dropdownToggle: HTMLElement = document.getElementById('submenu');
    if (dropdownToggleIcon && dropdownToggle) {
      dropdownToggleIcon.addEventListener('click', function () {
        dropdownToggle.classList.toggle('dropdown');
      });
    }
  }

  sideCloseNavcollapse(): void {
    let mobileCross = document.getElementById('mobileCross') as HTMLElement;
    this.highlightSelectedTab();
    let sidebar = document.getElementById('sidebar') as HTMLElement;
    mobileCross.addEventListener('click', function () {
      sidebar.classList.remove('active');
    });
    let content = document.getElementById('content') as HTMLElement;
    mobileCross.addEventListener('click', function () {
      content.classList.toggle('margin-active');
    });
  }

  closeAllAccordian(link) {
    var element: any = document.getElementsByClassName('accordion-header');
    for (let el of element) {
      el.setAttribute('aria-expanded', 'false');
      el.classList.add('collapsed');
    }

    var childItems: any = document.getElementsByClassName('sublist-item');
    for (let el of childItems) {
      el.classList.remove('show');
    }
    var parentLinks: any = document.getElementsByClassName('parent-link');
    for (let el of parentLinks) {
      const attr = el.getAttribute('routerLink');
      if (attr == link) {
        el.classList.add('mat-accent');
      }
    }
  }

  removeRouterClass() {
    var childItems: any = document.getElementsByClassName('mat-accent');
    for (let el of childItems) {
      el.classList.remove('mat-accent');
    }
  }

  ngAfterViewInit() {
    this.dropdownToggle();
  }

  isSubModuleUrlAvailable(nav: any) {
    return !!nav?.subModules?.some(
      (subModule: any) => !!subModule?.subModuleUrl
    );
  }
}
