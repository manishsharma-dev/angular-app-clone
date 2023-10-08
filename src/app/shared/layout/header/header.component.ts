import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/features/auth/auth.service';
import { DashBoardService } from 'src/app/features/dashboard/dashboard.service';
import { MemberList } from 'src/app/features/dashboard/model/member.model';
import { CountryService } from '../../shareService/country-service.service';
import { DashboardLayoutService } from '../dashboard-layout/dashboard-layout.service';
import { Location } from '@angular/common';
import {
  getSessionData,
  setEncryptedProjectData,
  setEncryptedRoleData,
  setSessionData,
} from '../../shareService/storageData';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { LanguageModel } from 'src/app/features/dashboard/model/language.model';
import { NotificationHeaderComponent } from '../../worklist/notification-header/notification-header.component';
import { NotificationService } from '../../worklist/notification/notification/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { ROUTES } from '../../routes';
import { DataServiceService } from '../../shareService/data-service.service';
import { Router } from '@angular/router';
import { UserManagementService } from 'src/app/features/admin-management/user-management/user-management.service';
import { event } from 'jquery';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { AppService } from '../../shareService/app.service';
import { distinctUntilChanged } from 'rxjs/operators';

export interface routeModal {
  path: string;
  title: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  userIsAuthenticated = false;
  private fontSizeOffset = 0;
  selected = '';
  public userDataRole: any = [];
  public userData: MemberList;
  getAccesRoles: any;
  notificationCount = 0;
  public userProjects: [] = [];
  public getUserProjects: [] = [];
  recentDashboardListData: any = [];
  selectedProject;
  isLoadingSpinner: boolean = false;
  public userDataDesc: any = [];
  selectedOption: string = '0';
  public languageLists: LanguageModel[] = [];
  private projectChangeSubject: Subscription;
  private isSnackOpen: Subscription;
  public getLan: string = 'English';
  public foruserDetail: any = true;
  allowedLanguagesCd = [1, 4, 5, 9, 11];

  @Output() public sideNavtoggle = new EventEmitter();
  constructor(
    private authService: AuthService,
    private translate: TranslateService,
    private countrySrv: CountryService,
    private dashboardService: DashboardLayoutService,
    private dashboardSrv: DashBoardService,
    private location: Location,
    private _snackBar: MatSnackBar,
    private notificationSrv: NotificationService,
    public dialog: MatDialog,
    private dataService: DataServiceService,
    private router: Router,
    private userservice: UserManagementService,
    private appService: AppService
  ) {}

  ngOnInit() {
    this.roleAccess();
    this.fetchRecentDashboardList();
    this.fetchNotificationsCount();
    this.userData = JSON.parse(sessionStorage.getItem('user'));
    this.userDataDesc = JSON.parse(
      sessionStorage.getItem('user')
    )?.defaultRoleAccess['roleDesc'];
    this.dashboardSrv.refreshNeeded.subscribe((respone: any) => {
      this.userDataRole = respone.split('-')[0];
      this.userDataDesc = respone.split('-')[1];
      const storageRoleData = {
        id: this.userDataRole,
      };
      setEncryptedRoleData(storageRoleData, 'AESSHA256userDataRole');
    });
    const storageProjectData = {
      id: this.selectedOption,
    };
    if (storageProjectData.id) {
      setEncryptedProjectData(
        storageProjectData,
        'AESSHA256storageProjectData'
      );
    }
    // const storageProjectData = {
    //   id: this.selectedOption,
    // };
    this.getLanguageList();
    if (storageProjectData.id) {
      setEncryptedProjectData(
        storageProjectData,
        'AESSHA256storageProjectData'
      );
    }
    this.getProject();
    this.projectChangeSubject = this.appService
      .getprojectChangeSubject()
      .pipe(distinctUntilChanged((p, n) => p === n && p != '0' && n != '0'))
      .subscribe((project: any) => {
        if (project != null) {
          this.selectedOption = project;
          this.mapProjectInfoSubject(project);
          //this.projectChange(project);
        }
      });
    this.isSnackOpen = this.appService
      .getisSnackOpenSubject()
      .subscribe((snack: any) => {
        if (snack) {
          this.openSnackBar();
        } else {
          this.closeSnackBar();
        }
      });
  }
  getLanguageList() {
    this.dashboardService.getLan().subscribe((response) => {
      this.languageLists = response;
      this.manageLanguage(this.languageLists);
      const langCode = getSessionData('language');
      if (langCode) {
        this.getLan = this.languageLists.find(
          (lang) => lang.cd == langCode
        )?.value;
        this.dashboardService.setlangauge(this.getLan);
        this.translate.use(this.getLan);
      } else {
        const engLanCode = this.languageLists.find(
          (lang) => lang.value == 'English'
        )?.cd;
        this.dashboardService.setlangauge('English');
        this.translate.setDefaultLang('English');
        //this.translate.use('English');
        setSessionData(engLanCode, 'language');
      }
    });
  }

  manageLanguage(languageList) {
    this.languageLists = languageList.filter((lang) =>
      this.allowedLanguagesCd.includes(lang.cd)
    );
  }

  onUserDetails() {
    //  this.isLoadingSpinner = true;
    let userval = JSON.parse(sessionStorage.getItem('user'));
    sessionStorage.setItem('data', userval.userId);
    sessionStorage.setItem('isProfile', 'true');
    this.userservice.userUpdateList.next(true);
    this.router.navigate(['dashboard/user-management/user-details']);
  }

  onLogout() {
    this.authService.logout();
    this.isLoadingSpinner = true;
  }
  dateFormatChange(date: String) {
    date = date.substring(0, 10);
    return date.split('-').reverse().join('/');
    this.isLoadingSpinner = true;
  }

  fetchNotificationsCount() {
    this.notificationSrv.getNotificationCount().subscribe((count) => {
      this.notificationCount = count.unreadCount;
    });
  }

  ngOnDestroy() {
    this.projectChangeSubject.unsubscribe();
  }

  roleAccess() {
    this.getAccesRoles = JSON.parse(
      sessionStorage.getItem('user')
    )?.defaultRoleAccess;
    this.selected = this.getAccesRoles?.roleDesc;
    const storageRoleData = {
      id: JSON.stringify(this.getAccesRoles?.roleCd),
    };
    setEncryptedRoleData(storageRoleData, 'AESSHA256userDataRole');
  }

  getProject() {
    this.userProjects = JSON.parse(sessionStorage.getItem('user'))?.userProject;
    const storageData = {
      id: this.userProjects,
    };
  }
  getSelectedProject(event?: Event) {
    let selectedProject = (event.target as HTMLInputElement).value;
    if (selectedProject != '0') {
      this.appService.setisSnackOpenSubject(false);
    }
    this.projectChange(selectedProject);
  }

  projectChange(selectedProject: any): void {
    const storageProjectData = {
      id: selectedProject,
    };
    if (storageProjectData.id) {
      setEncryptedProjectData(
        storageProjectData,
        'AESSHA256storageProjectData'
      );
    }
    this.mapProjectInfoSubject(selectedProject);
  }

  mapProjectInfoSubject(selectedProject) {
    this.dataService.setProjectInfo(selectedProject);
  }

  onToggleSideNav(): void {
    this.sideNavtoggle.emit();
  }
  useLanguage(language: any) {
    //this.dashboardService.Language.next(language.value);
    this.translate.use(language.value);
    this.getLan = language.value;
    setSessionData(language.cd, 'language');
    this.dashboardService.setlangauge(language.value);
  }
  increaseFontSize() {
    document.body.style.setProperty(
      'font-size',
      `calc(1rem + ${++this.fontSizeOffset}px)`
    );
  }

  decreaseFontSize() {
    document.body.style.setProperty(
      'font-size',
      `calc(1rem + ${--this.fontSizeOffset}px)`
    );
  }
  getPassRole(role) {
    console.log(role);
  }

  getTitle() {
    const route: routeModal = this.getCurrentRoute();
    if (route) {
      return route.title;
    }
    return 'Dashboard';
  }
  getCurrentRoute(): routeModal {
    const routeurl = this.location.path();
    const route = ROUTES.find((route) => routeurl.includes(route.path));
    return route;
  }

  trackByFn(index: number, item: number | string) {
    console.log(index, item);
  }

  openNotificationList() {
    this.dialog
      .open(NotificationHeaderComponent, {
        data: {
          title: 'Warning!',
          message: 'Owner with Similar Name already exists!',
          primaryBtnText: 'Register Anyways',
          secondaryBtnText: 'Cancel',
        },
      })
      .afterClosed()
      .subscribe((res: boolean) => {});
  }

  fetchRecentDashboardList() {
    this.isLoadingSpinner = true;
    this.notificationSrv.fetchRecentNotificationsList().subscribe(
      (data: any) => {
        data.data
          ? (this.recentDashboardListData = data.data)
          : (this.recentDashboardListData = data);
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  getMobileNumberVerfyPopup() {
    this.authService.mobileNumberVerificationPopup();
  }

  openSnackBar() {
    this._snackBar.open('You have not selected any project.', null, {
      duration: 2000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: ['info-snackbar', 'project-snackbar-style'],
    });
  }

  closeSnackBar() {
    this._snackBar.dismiss();
  }
  onResetPassword() {
    this.authService.resetDialogPopup();
  }
}
