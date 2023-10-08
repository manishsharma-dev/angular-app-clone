import { OwnerDetailsService } from './../../../features/animal-management/owner-registration/owner-details.service';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { DashboardLayoutService } from './dashboard-layout.service';

import { AppService } from '../../shareService/app.service';
import { AnimalManagementService } from '../../../features/animal-management/animal-registration/animal-management.service';
import { AnimalManagementConfig } from '../../animal-management.config';
import { AuthService } from 'src/app/features/auth/auth.service';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css'],
})
export class DashboardLayoutComponent implements OnDestroy, AfterViewInit {
  public userDataRole: any;
  isLoadingSpinner: boolean = false;
  recentDashboardListData: any = [];
  animalMgmtConfigKeys = [
    'ownerAge',
    'ownerNameLength',
    'ownerAddress',
    'animalDOBLimit',
    'minAgeForPregnancy',
    'taggingDateLimit',
    'ownershipTransferDateLimit',
    'earTagChangeDateLimit',
    'animalDeathDateLimit',
  ];
  public defaultRoleCd = JSON.parse(sessionStorage.getItem('user'))
    .defaultRoleCd;

  constructor(
    private translate: TranslateService,
    private dashboardService: DashboardLayoutService,
    private router: Router,
    private appService: AppService,
    private animalMS: AnimalManagementService,
    private ownerDS: OwnerDetailsService,
    private authService: AuthService,
    private readonly translateService: TranslateService,
    public dialog: MatDialog
  ) {
    appService.getCurrentUrl();
  }

  ngOnInit() {
    this.userDataRole = JSON.parse(sessionStorage.getItem('user'));
    if (!sessionStorage.getItem('animalMgmtConfig')) {
      this.getAnimalMgmtConfigData();
    } else {
      this.addDataToConfig();
    }

    this.sideNavcollapse();

    this.dashboardService.getlangauge().subscribe((response: any) => {
      this.translate.setDefaultLang(response);
    });
  }

  ngAfterViewInit(): void {
    this.getCuurentServerDate();
  }

  useLanguage(language: any) {
    this.dashboardService.setlangauge(language.target.value);
    this.translate.use(language.target.value);
  }

  getAnimalMgmtConfigData() {
    this.isLoadingSpinner = true;
    this.animalMS
      .getConfigDataForAnimalMgmt(this.animalMgmtConfigKeys)
      .subscribe(
        (cnfObjects) => {
          let indx = 0;
          for (let crrKey of this.animalMgmtConfigKeys) {
            AnimalManagementConfig[crrKey] = cnfObjects[indx++][crrKey];
          }
          this.isLoadingSpinner = false;
          sessionStorage.setItem(
            'animalMgmtConfig',
            JSON.stringify(AnimalManagementConfig)
          );
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
    this.ownerDS.getCommonData('admin_livestack').subscribe(
      (adminCd) => {
        let adminCds = adminCd[0].value.split(',');
        // adminCds.push('1');
        if (adminCds.indexOf(String(this.defaultRoleCd)) !== -1) {
          sessionStorage.setItem('isLivesatckAdmin', 'true');
        } else {
          sessionStorage.setItem('isLivesatckAdmin', 'false');
        }
      },
      (err) => {}
    );
    this.ownerDS.getCommonData('admin_district').subscribe(
      (adminCd) => {
        let adminCds = adminCd[0].value.split(',');
        // adminCds.push('1');
        if (adminCds.indexOf(String(this.defaultRoleCd)) !== -1) {
          sessionStorage.setItem('isDistrictAdmin', 'true');
        } else {
          sessionStorage.setItem('isDistrictAdmin', 'false');
        }
      },
      (err) => {}
    );
  }

  addDataToConfig() {
    const data = JSON.parse(sessionStorage.getItem('animalMgmtConfig'));
    for (let crrData in data) {
      AnimalManagementConfig[crrData] = data[crrData];
    }
  }

  ngOnDestroy(): void {}

  sideNavcollapse(): void {
    let sidebarCollapse: HTMLElement =
      document.getElementById('sidebarCollapse');
    let sidebar: HTMLElement = document.getElementById('sidebar');
    sidebarCollapse.addEventListener('click', function () {
      sidebar.classList.toggle('active');
    });

    let content: HTMLElement = document.getElementById('content');
    sidebarCollapse.addEventListener('click', function () {
      content.classList.toggle('margin-active');
    });
  }

  getCuurentServerDate() {
    this.dashboardService.getCurrentServeDate().subscribe(
      (date) => {
        sessionStorage.setItem('serverCurrentDateTime', date.message);
      },
      (error) => {
        this.dialog
          .open(ConfirmationDialogComponent, {
            data: {
              title: this.translateService.instant('common.info_label'),
              message: this.translateService.instant(
                'common.some_error_occured'
              ),
              primaryBtnText: this.translateService.instant('common.ok_string'),
              errorFlag: true,

              icon: 'assets/images/info.svg',
            },
            disableClose: true,
            width: '500px',
            panelClass: 'common-info-dialog',
          })
          .afterClosed()
          .subscribe((flag: any) => {
            this.authService.logout();
          });
        return;
      }
    );
  }
}
