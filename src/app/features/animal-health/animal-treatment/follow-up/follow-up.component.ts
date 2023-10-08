import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import { switchMap, catchError } from 'rxjs/operators';
import { AnimalDetailService } from 'src/app/features/animal-management/animal-registration/animal-details/animal-detail.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { MasterConfig } from 'src/app/shared/master.config';
import { AppService } from 'src/app/shared/shareService/app.service';
import { getSessionData } from 'src/app/shared/shareService/storageData';
// import { AnimalDetails } from 'src/app/features/animal-management/animal-registration/models-animal-reg/animal-details.model';
import { HealthService } from '../../health.service';
import { AnimalDetails } from '../../models/animal.model';
import { TreatmentResponseDialogComponent } from '../../treatment-response-dialog/treatment-response-dialog.component';
import { AnimalTreatmentService } from '../animal-treatment.service';
import { SampleLocation } from '../models/enums/sample.enum';
import { ExpandableTreatmentHistory } from '../models/expandable-treatment-history.model';
import { TreatmentHistoryModel } from '../models/master.model';
import { OpenTreatmentCasesResponse } from '../models/open-treatment-response.model';
import { UpdateLabComponent } from '../update-lab/update-lab.component';
import { UpdateResultsComponent } from '../update-results/update-results.component';
import { ViewPrescriptionComponent } from '../view-prescription/view-prescription.component';
import { ViewReportComponent } from '../view-report/view-report.component';
import { of } from 'rxjs';
import { AuthService } from 'src/app/features/auth/auth.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-follow-up',
  templateUrl: './follow-up.component.html',
  styleUrls: ['./follow-up.component.css'],
  providers: [TranslatePipe],
})
export class FollowUpComponent implements OnInit {
  masterConfig = MasterConfig;
  animalId: string = '';
  animal!: AnimalDetails;
  expandedElement!: TreatmentHistoryModel | null;
  dataSource: ExpandableTreatmentHistory[] = [];
  isLoadingSpinner = false;

  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private treatmentService: AnimalTreatmentService,
    private animalMgmtService: AnimalDetailService,
    private healthService: HealthService,
    private appService: AppService,
    private translatePipe: TranslatePipe,
    private location: Location,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.getCurrentRoute();
  }

  getCurrentRoute() {
    this.isLoadingSpinner = true;
    this.route.paramMap
      .pipe(
        switchMap((params: any) => {
          this.animalId = params.get('animalId');

          return this.animalMgmtService.getAnimalDetails(this.animalId);
        }),
        switchMap((animalData) => {
          this.animal = animalData;
          const obs = this.treatmentService.getOpenTreatmentCases(
            animalData.tagId
          );
          return obs.pipe(
            catchError((err) => {
              if (err.status === 401) {
                return this.authService.refreshToken().pipe(
                  switchMap((token) => {
                    sessionStorage.setItem('token', token.access_token);
                    sessionStorage.setItem(
                      'refresh_token',
                      token.refresh_token
                    );
                    // this.authService.refreshTokenSubject.next(token);
                    sessionStorage.setItem('refreshToken', token.refresh_token);
                    return this.treatmentService.getOpenTreatmentCases(
                      animalData.tagId
                    );
                  })
                );
              }

              return of(null);
            })
          );
        })
      )
      .subscribe(
        (treatmentCases) => {
          this.isLoadingSpinner = false;

          if (
            (!this.animal.ownerDetails.orgType &&
              this.animal.ownerDetails.registrationStatus != '1') ||
            this.animal.animalStatusCd != 1
          ) {
            this.dialog.open(TreatmentResponseDialogComponent, {
              data: {
                title: this.translatePipe.transform('common.info_label'),

                icon: 'assets/images/info.svg',
                message: this.translatePipe.transform(
                  'animalTreatmentSurgery.owner_animal_is_not_active_new_transaction_cannot_be_created'
                ),
                primaryBtnText:
                  this.translatePipe.transform('common.ok_string'),
              },
              panelClass: 'common-info-dialog',
            });
          } else if (!treatmentCases.flg) {
            const isPermission = this.appService.isPermission(
              MasterConfig.isAdd
            );
            if (isPermission) {
              var message = this.translatePipe.transform(
                'animalTreatmentSurgery.no_treatment_cases_found_do_you_want_to_create_a_new_case'
              );
              var primaryBtnText = this.translatePipe.transform('common.yes');
              var secondaryBtnText = this.translatePipe.transform('common.no');
              this.dialog
                .open(TreatmentResponseDialogComponent, {
                  data: {
                    title: this.translatePipe.transform('common.info_label'),
                    icon: 'assets/images/info.svg',
                    message: message,
                    primaryBtnText: primaryBtnText,
                    secondaryBtnText: secondaryBtnText,
                  },
                  panelClass: 'common-info-dialog',
                })
                .afterClosed()
                .subscribe((res: boolean) => {
                  if (res) {
                    let title = '';
                    if (
                      !this.animal.ownerDetails.orgType &&
                      this.animal.ownerDetails.registrationStatus != '1'
                    ) {
                      this.dialog.open(TreatmentResponseDialogComponent, {
                        data: {
                          title:
                            this.translatePipe.transform('common.info_label'),

                          icon: 'assets/images/info.svg',
                          message: this.translatePipe.transform(
                            'animalTreatmentSurgery.owner_is_not_active_new_transaction_cannot_be_created'
                          ),
                          primaryBtnText:
                            this.translatePipe.transform('common.ok_string'),
                        },
                        panelClass: 'common-info-dialog',
                      });
                      return;
                    }

                    switch (this.animal.animalStatusCd) {
                      case 1:
                        this.router.navigate(['../..', 'newcase'], {
                          relativeTo: this.route,
                          queryParams: { animalId: this.animalId },
                        });
                        return;

                      case 3:
                        title = this.translatePipe.transform(
                          'animalTreatmentSurgery.animal_is_dead'
                        );
                        break;
                      default:
                        title = this.translatePipe.transform(
                          'animalTreatmentSurgery.animal_is_not_active'
                        );
                        break;
                    }

                    this.dialog
                      .open(TreatmentResponseDialogComponent, {
                        data: {
                          title,
                          icon: 'assets/images/info.svg',
                          message: this.translatePipe.transform(
                            'animalTreatmentSurgery.new_transaction_cannot_be_created'
                          ),
                          primaryBtnText:
                            this.translatePipe.transform('common.ok_string'),
                        },
                        panelClass: 'common-info-dialog',
                      })
                      .afterClosed()
                      .subscribe(() => {
                        this.router.navigate(['../..'], {
                          relativeTo: this.route,
                          queryParams: { ownerId: this.animal.ownerId },
                        });
                      });
                  } else {
                    this.router.navigate(['../..'], {
                      relativeTo: this.route,
                      queryParams: { ownerId: this.animal.ownerId },
                    });
                  }
                });
            } else {
              var message = this.translatePipe.transform(
                'animalTreatmentSurgery.no_treatment_cases_found'
              );
              var primaryBtnText =
                this.translatePipe.transform('common.ok_string');
              this.dialog
                .open(TreatmentResponseDialogComponent, {
                  data: {
                    title: this.translatePipe.transform('common.info_label'),
                    icon: 'assets/images/info.svg',
                    message: message,
                    primaryBtnText: primaryBtnText,
                    secondaryBtnText: secondaryBtnText,
                  },
                  panelClass: 'common-info-dialog',
                })
                .afterClosed()
                .subscribe((res: boolean) => {
                  if (res) {
                    this.router.navigate(['../..'], {
                      relativeTo: this.route,
                      queryParams: { ownerId: this.animal.ownerId },
                    });
                  }
                });
            }

            return;
          }

          // this.diseases = diseases;

          // Grouped Cases based on caseId
          if (treatmentCases.data) {
            const groupedCases = treatmentCases?.data.reduce(
              (group: any, currentCase: any) => {
                const { caseId } = currentCase;

                if (!group[caseId]) {
                  group[caseId] = { expanded: false, cases: [] };
                }

                group[caseId].cases.push({
                  ...currentCase,
                  diseaseDetails: currentCase.diseaseDetails
                    .map((d) => d.diseaseDesc)
                    .join(', '),
                });
                return group;
              },
              {} as { [caseId: number]: ExpandableTreatmentHistory }
            );

            const arr: ExpandableTreatmentHistory[] = [];

            for (const caseId in groupedCases) {
              arr.push(groupedCases[caseId]);
            }
            arr.sort((a, b) => {
              return b['cases'][0]['treatmentDate'].localeCompare(
                a['cases'][0]['treatmentDate']
              );
            });
            this.dataSource = arr;
          }
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
  }

  viewPrescription(caseId: number, followUpNo: number) {
    // const dialogRef = this.dialog.open(ViewPrescriptionComponent, {
    //   position: {
    //     right: '0px',
    //     top: '0px',
    //   },
    //   panelClass: 'custom-dialog-container',
    //   width: '700px',
    //   height: '100vh',
    //   data: {
    //     caseId,
    //     followUpNo,
    //   },
    // });
    // dialogRef.afterClosed().subscribe((res) => {});
    this.treatmentService

      .downloadPrescription({
        caseId: caseId,
        followUpNo: followUpNo,
      })

      .subscribe(
        (res: any) => {
          this.isLoadingSpinner = false;
          const blob = new Blob([res.body], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const popUp = window.open(url, '_blank');
          if (popUp == null || typeof popUp == 'undefined') {
            this.dialog.open(TreatmentResponseDialogComponent, {
              data: {
                title: this.translatePipe.transform('errorMsg.popup_blocked'),
                icon: 'assets/images/info.svg',
                message: this.translatePipe.transform(
                  'errorMsg.please_disable_your_popup_blocker_and_click_the_view_link_again'
                ),
                primaryBtnText:
                  this.translatePipe.transform('common.ok_string'),
              },
              panelClass: 'common-info-dialog',
            });
          } else {
            popUp.focus();
          }
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
  }

  manageDiagnostics(selectedCase: OpenTreatmentCasesResponse) {
    switch (selectedCase.samplingStatus) {
      case 1:
        this.updateResult(selectedCase);
        break;
      case 2:
        this.viewReport(selectedCase);
        break;
    }
  }

  updateResult(list: any) {
    if (
      list &&
      (!list.radiologyDetails.length ||
        list.radiologyDetails?.every((a: any) => a.testImageUrl1)) &&
      (!list.sampleDetails?.onSpotDetails?.length ||
        list.sampleDetails?.onSpotDetails?.every(
          (a: any) => a.samplingStatus == 2
        )) &&
      list.sampleDetails?.labTestingDetails?.length &&
      list.sampleDetails?.samplingStatus == 1
    ) {
      // this.dialog.open(TreatmentResponseDialogComponent, {
      //   data: {
      //     icon: "assets/images/alert.svg",
      //     title: 'Report pending from Lab.',
      //     primaryBtnText: this.translatePipe.transform('common.ok_string'),
      //   },
      // });
      this.isLoadingSpinner = true;
      this.treatmentService
        .getTreatmentDetails(list.caseId, list.followUpNo)
        .subscribe((response: any) => {
          this.isLoadingSpinner = false;
          const dialogRef = this.dialog.open(UpdateLabComponent, {
            position: {
              right: '0px',
              top: '0px',
            },
            data: {
              data: response,
              animal: this.animal,
            },
            width: '600px',
            height: '100vh',
            panelClass: 'custom-dialog-container',
          });
          dialogRef.afterClosed().subscribe((res: boolean) => {
            if (!res) {
              return;
            }
            this.dialog.open(TreatmentResponseDialogComponent, {
              data: {
                title: this.translatePipe.transform('common.info_label'),

                icon: 'assets/images/info.svg',
                message: this.translatePipe.transform(
                  'animalTreatmentSurgery.lab_results_saved_successfully'
                ),
                primaryBtnText:
                  this.translatePipe.transform('common.ok_string'),
                secondaryBtnText: '',
              },
              panelClass: 'common-info-dialog',
            });
            this.getCurrentRoute();
          });
        });
      return;
    } else {
      this.isLoadingSpinner = true;
      this.treatmentService
        .getTreatmentDetails(list.caseId, list.followUpNo)
        .subscribe((response: any) => {
          this.isLoadingSpinner = false;
          const dialogRef = this.dialog.open(UpdateResultsComponent, {
            position: {
              right: '0px',
              top: '0px',
            },
            data: {
              data: response,
              animal: this.animal,
            },
            width: '600px',
            height: '100vh',
            panelClass: 'custom-dialog-container',
          });
          dialogRef.afterClosed().subscribe((res: boolean) => {
            if (!res) {
              return;
            }
            this.dialog.open(TreatmentResponseDialogComponent, {
              data: {
                title: this.translatePipe.transform('common.info_label'),

                icon: 'assets/images/info.svg',
                message: this.translatePipe.transform(
                  'animalTreatmentSurgery.diagnostics_results_saved_successfully'
                ),
                primaryBtnText:
                  this.translatePipe.transform('common.ok_string'),
                secondaryBtnText: '',
              },
              panelClass: 'common-info-dialog',
            });
            this.getCurrentRoute();
          });
        });
    }
  }

  viewReport(selectedCase: OpenTreatmentCasesResponse) {
    this.isLoadingSpinner = true;
    this.treatmentService
      .getTreatmentDetails(selectedCase.caseId, selectedCase.followUpNo)
      .subscribe((response: any) => {
        this.isLoadingSpinner = false;
        const dialogRef = this.dialog.open(ViewReportComponent, {
          position: {
            right: '0px',
            top: '0px',
          },
          data: response,
          width: '600px',
          height: '100vh',
          panelClass: 'custom-dialog-container',
        });
        dialogRef.afterClosed().subscribe((res: boolean) => {
          if (!res) {
            return;
          }
          this.dialog.open(TreatmentResponseDialogComponent, {
            data: {
              title: this.translatePipe.transform('common.info_label'),

              icon: 'assets/images/info.svg',
              message: this.translatePipe.transform(
                'animalTreatmentSurgery.diagnostics_results_saved_successfully'
              ),
              primaryBtnText: this.translatePipe.transform('common.ok_string'),
              secondaryBtnText: '',
            },
            panelClass: 'common-info-dialog',
          });
          this.getCurrentRoute();
        });
      });
  }

  navigateToNewFollowUp(animalId: number, caseId: number, followUpNo: number) {
    let title = '';
    if (
      !this.animal.ownerDetails.orgType &&
      this.animal.ownerDetails.registrationStatus != '1'
    ) {
      this.dialog.open(TreatmentResponseDialogComponent, {
        data: {
          title: this.translatePipe.transform('common.info_label'),

          icon: 'assets/images/info.svg',
          message: this.translatePipe.transform(
            'animalTreatmentSurgery.owner_is_not_active_new_transaction_cannot_be_created'
          ),
          primaryBtnText: this.translatePipe.transform('common.ok_string'),
        },
        panelClass: 'common-info-dialog',
      });
      return;
    }
    switch (this.animal.animalStatusCd) {
      case 1:
        this.router.navigate(['../..', 'newcase'], {
          queryParams: { animalId, caseId, followUpNo },
          relativeTo: this.route,
        });
        return;

      case 3:
        title = this.translatePipe.transform(
          'animalTreatmentSurgery.animal_is_dead'
        );
        break;
      default:
        title = this.translatePipe.transform(
          'animalTreatmentSurgery.animal_is_not_active'
        );
        break;
    }

    this.dialog.open(TreatmentResponseDialogComponent, {
      data: {
        title,

        icon: 'assets/images/info.svg',
        message: this.translatePipe.transform(
          'animalTreatmentSurgery.new_transaction_cannot_be_created'
        ),
        primaryBtnText: this.translatePipe.transform('common.ok_string'),
      },
      panelClass: 'common-info-dialog',
    });
  }

  goBack() {
    this.location.back();
  }

  toggleExpandRow(index: number) {
    this.dataSource[index].expanded = !this.dataSource[index].expanded;
  }

  getAnimalAge(ageInMonths: number) {
    return this.treatmentService.getWords(ageInMonths);
  }

  formatDate(date: string) {
    return moment(date).format('DD/MM/YYYY');
  }

  isUpdate(data, flag) {
    if (
      this.animal.animalStatusCd !== 1 &&
      this.animal.ownerDetails.registrationStatus != '1'
    ) {
      return false;
    }

    const currentDate: any = new Date(
      sessionStorage.getItem('serverCurrentDateTime')
    );
    const caseDate: any = new Date(data.treatmentRecordDate);
    const diffdate = this.treatmentService.getDifferenceDate(
      currentDate,
      caseDate
    );

    const result = data?.sampleDetails?.labTestingDetails?.some(
      (sample) =>
        sample.samplingStatus === 2 &&
        +sample.testingLocation == SampleLocation.labTesting
    );
    // const diffTime = Math.abs(currentDate - caseDate);
    if (diffdate < 1) {
      return true && !result;
    }
    return false;
  }
}
