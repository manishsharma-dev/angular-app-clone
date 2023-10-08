import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { getSessionData, setSessionData } from './storageData';
import { DataServiceService } from './data-service.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subscription, combineLatest, forkJoin } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class AppService {
  fetchProjectInfo!: Subscription;
  projectChangeSubject = new BehaviorSubject<any>(null);
  isSnackOpenSubject = new BehaviorSubject<any>(null);
  constructor(private router: Router, private _dataService: DataServiceService, private dialog: MatDialog, private translateService: TranslateService) {
    const req1 = this.router.events.pipe(filter((event) => event instanceof NavigationEnd));
    const req2 = this._dataService.fetchProjectInfo;
    combineLatest([req1, req2]).subscribe(([event, res]: [NavigationEnd, number | string]) => {
      this.getModulebyUrl(event.url.replace('/dashboard', ''));
      const moduleList = getSessionData('moduleList');
      const url = this.router.url.replace('/dashboard', '');
      const filteredData = moduleList?.map((element) => {
        return {
          ...element,
          subModules: element.subModules.filter(
            (subElement) => subElement.subModuleUrl === url
          ),
        };
      });
      const currentModule = filteredData?.find(
        (module) => module.subModules.length
      );
      const userProjectDetails = this._dataService._fetchLoggedUserDatails()?.userProject;
      if (res && res != "0" && userProjectDetails && userProjectDetails.length && url && currentModule) {
        const userProject = userProjectDetails.find((proj: any) => proj.projectId == res);
        if (userProject?.activityCd.includes(currentModule?.subModules[0].subModuleCd)) {
          if (currentModule) {
            this.setCurrentModule(
              currentModule.moduleCd,
              currentModule.subModules[0].subModuleCd
            );
          }
        }
        else {
          this.dialog.open(ConfirmationDialogComponent, {
            data: {
              title: this.translateService.instant('common.info_label'),
              message: this.translateService.instant(
                'errorMsg.incorrect_project_selected'
              ),
              primaryBtnText: this.translateService.instant('common.ok_string'),
              errorFlag: true,
              icon: 'assets/images/info.svg',
            },
            width: '500px',
            disableClose: true,
            panelClass: 'common-info-dialog',
          }).afterClosed().subscribe((result) => {
            this.setprojectChangeSubject("0");
          });
          return;
        }
      }
      else {
        if (currentModule) {
          const currentSubModule = currentModule?.subModules[0].subModuleCd;
          const currentActivityList = [...new Set(userProjectDetails.map((userProjectDetails) => userProjectDetails.activityCd)?.flat())];
          const isSubModuleinProject = currentActivityList.some((activity) => activity == currentSubModule);
          if (url && isSubModuleinProject) {
            this.setisSnackOpenSubject(true);
          }
          else {
            this.setisSnackOpenSubject(false);
          }
          this.setCurrentModule(
            currentModule.moduleCd,
            currentModule.subModules[0].subModuleCd
          );
        }
        else {
          this.setisSnackOpenSubject(false);
        }

      }
    });
  }

  getModulebyUrl(url: string) {
    const moduleList = getSessionData('moduleList');
    const filteredData = moduleList?.map((element) => {
      return {
        ...element,
        subModules: element.subModules.filter(
          (subElement) => subElement.subModuleUrl === url
        ),
      };
    });
    const currentModule = filteredData?.find(
      (module) => module.subModules.length
    );
    if (currentModule) {
      this.setCurrentModule(
        currentModule.moduleCd,
        currentModule.subModules[0].subModuleCd
      );
    }
  }

  getCurrentUrl(flag?: boolean) {
    this.fetchProjectInfo?.unsubscribe();
    if (flag) {
      this.getModulebyUrl(this.router.url.replace('/dashboard', ''));
    }
  }

  getprojectChangeSubject() {
    return this.projectChangeSubject.asObservable();
  }

  setprojectChangeSubject(projectId) {
    this.projectChangeSubject.next(projectId);
  }

  getisSnackOpenSubject() {
    return this.isSnackOpenSubject.asObservable();
  }

  setisSnackOpenSubject(isSnackOpenSubject) {
    this.isSnackOpenSubject.next(isSnackOpenSubject);
  }

  setCurrentModule(moduleCd, subModuleCd) {
    const storageData = {
      moduleCd: moduleCd,
      subModuleCd: subModuleCd,
    };
    setSessionData(storageData, 'subModuleCd');
  }

  isPermission(permission: any) {
    const currentSection = getSessionData('subModuleCd');
    const currentModules = getSessionData('moduleList');
    const selectedModule = currentModules.find(
      (module) => module?.moduleCd == currentSection?.moduleCd
    );
    if (selectedModule)
      var currentSubModule = selectedModule?.subModules?.find(
        (subModule) =>
          subModule?.subModuleCd == currentSection?.subModuleCd &&
          subModule[permission]
      );
    if (currentSubModule) return true;
    return false;
  }

  isRoutePermission(url: string, permission: any) {
    const currentModules = getSessionData('moduleList');

    return !!currentModules.find((c) =>
      c.subModules.some((r) => r.subModuleUrl == url && r[permission])
    );
  }

}
