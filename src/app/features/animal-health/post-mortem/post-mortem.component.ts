import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import { filter, switchMap } from 'rxjs/operators';
import { MasterConfig } from 'src/app/shared/master.config';
import { NumericValidation } from 'src/app/shared/utility/validation';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { AnimalResult } from '../../animal-management/animal-registration/models-animal-reg/tagId-search.model';
import {
  AnimalRegistrationList,
  CompleteOwnerDetails,
} from '../../animal-management/owner-registration/models-owner-reg/get-ownerby-ownerID.model';
import { AnimalTreatmentService } from '../animal-treatment/animal-treatment.service';
import { UpdateLabComponent } from '../animal-treatment/update-lab/update-lab.component';
import { HealthService } from '../health.service';
import { TreatmentResponseDialogComponent } from '../treatment-response-dialog/treatment-response-dialog.component';
import { PostMortemDetailsRes } from './models/postmortem-details.model';
import { SaveInDraftResponse } from './models/saveInDraftResponse.model';
import { PostMortemService } from './post-mortem.service';
import { OwnerDetailsService } from '../../animal-management/owner-registration/owner-details.service';
import {
  OwnerType,
  SearchValue,
} from 'src/app/shared/common-search-box/common-search-box.component';
import { OwnerData } from '../../animal-management/owner-registration/models-owner-reg/get-owner-details.model';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { OwnerDetails } from 'src/app/shared/shareService/model/owner.detail';
import { OtpDialogComponent } from 'src/app/shared/otp-dialog/otp-dialog.component';
import { RegisterOwner } from '../../animal-management/owner-registration/models-owner-reg/register-owner.model';

export interface PostMortemDetail {
  species: string;
  sex: string;
  age: number | string;
  tagID: number;
  pregnancyStatus: string;
  milkingStatus: string;
  breed: string;
}

@Component({
  selector: 'app-post-mortem',
  templateUrl: './post-mortem.component.html',
  styleUrls: ['./post-mortem.component.css'],
  providers: [TranslatePipe],
})
export class PostMortemComponent implements OnInit {
  masterConfig = MasterConfig;
  validationsMsg = animalHealthValidations.postMortem;
  ownerDetailsSection: boolean = false;
  animalDetailsSectionVisible: boolean = false;
  errorMessage: string = '';
  ownerDetailsByID!: CompleteOwnerDetails;
  isLoadingSpinner: boolean = false;
  animalDetails!: PostMortemDetail;
  isPostMortemDetails = false;
  postmortemDetailsRes?: PostMortemDetailsRes;

  postMortemDetails: PostMortemDetailsRes['postmortemDetails'][] = [];
  tableDataSource = new MatTableDataSource<AnimalRegistrationList>();
  draftDataSource: SaveInDraftResponse[] = [];
  showDraft = false;
  isOwnersListVisible = false;
  isOwnerDetailsSectionVisible = false;
  ownerDataSource = new MatTableDataSource([]);
  selectedAnimalId: any = null;
  ownerTypeCd = OwnerType.individual;
  animalPageIndex = 0;
  animalPageSize = 5;
  animalsCount = 0;
  searchObj: SearchValue;
  ownerData!: RegisterOwner;
  ownerInfoForm!: FormGroup;
  ownerDetailsRecord: any[] = [];

  @ViewChild('ownerPaginator') private set ownerPaginator(mp: MatPaginator) {
    this.ownerDataSource.paginator = mp;
  }

  @ViewChild('animalPaginator') animalPaginator: MatPaginator;

  displayedColumns: string[] = [
    'radio',
    'tagId',
    'category',
    'animalCategory',
    'breed',
    'sex',
    'age',
    'pregnancyStatus',
    'milkingStatus',
    'status',
  ];
  postMortemColumns = [
    'id',
    'date',
    'sample_status',
    'post_mortem_status',
    'report',
    'edit',
  ];
  animalKeys: string[] = [
    'taggingDate',
    'tagId',
    'species',
    'speciesCd',
    'isLoanOnAnimal',
    'dateOfBirth',
    'ownerId',
    'registrationDate',
    'registrationStatus',
    'sex',
    'ageInMonths',
    'animalStatusCd',
    'animalStatus',
    'animalId',
    'animalName',
    'milkingStatus',
    'pregnancyStatus',
    'breedAndExoticLevels',
    'animalCategory',
  ];
  ownerColumns = [
    'sNo',
    'ownerId',
    'ownerName',
    'ownerMobileNo',
    'ownerDateOfBirth',
    'ownerGender',
    'villageName',
    'arrow',
  ];

  draftColumns = ['#', 'tagId', 'creationDate', 'openDraft'];

  constructor(
    public dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private treatmentService: AnimalTreatmentService,
    private route: ActivatedRoute,
    private postmortemService: PostMortemService,
    private healthService: HealthService,
    private router: Router,
    private translatePipe: TranslatePipe,
    private ownerDS: OwnerDetailsService
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        filter((params) => params.keys.length === 0),
        switchMap(() => {
          this.isLoadingSpinner = true;
          return this.healthService.getDraftTransactionDetails();
        })
      )
      .subscribe(
        (res) => {
          this.isLoadingSpinner = false;
          if (this.healthService.isErrorResponse(res)) return;
          this.showDraft = true;
          this.draftDataSource = res;
        },
        (err) => (this.isLoadingSpinner = false)
      );
  }

  getParsedDate(date: string) {
    return moment(date).format('LT') + ' ' + moment(date).format('DD/MM/YYYY');
  }

  getDetailsByTagID(searchValue: string) {
    this.isLoadingSpinner = true;
    this.isPostMortemDetails = false;
    this.animalDetailsSectionVisible = false;
    // fetching postmortem details
    this.healthService
      .getDetailsByTagID(searchValue)
      .pipe(
        switchMap((res) => {
          this.ownerTypeCd = (res as any)?.ownerDetails?.ownerTypeCd;
          return this.postmortemService.getPostmortemDetail(+res.animalId);
        })
      )
      .subscribe(
        (res) => {
          this.isLoadingSpinner = false;
          if (this.healthService.isErrorResponse(res)) {
            return;
          }
          this.postmortemDetailsRes = res;
          const animalList = {} as AnimalRegistrationList;

          for (const key of this.animalKeys) {
            (<any>animalList[key as keyof AnimalRegistrationList]) =
              res.animalDetails[key as keyof AnimalResult];
          }

          if (res.postmortemDetails != null) {
            this.isPostMortemDetails = true;
            this.postMortemDetails = [
              {
                ...res.postmortemDetails,
                ...res,
              },
            ];
          }

          this.showDraft = false;
          this.tableDataSource.data = [animalList];

          this.animalDetailsSectionVisible = true;
        },
        () => (this.isLoadingSpinner = false)
      );
  }

  onSearch(searchObj: SearchValue) {
    this.onReset(false);
    this.searchObj = searchObj;
    this.isLoadingSpinner = true;

    if (
      !isNaN(+this.searchObj.searchValue) &&
      (this.searchObj.searchValue.length === 8 ||
        this.searchObj.searchValue.length === 11 ||
        this.searchObj.searchValue.length === 12)
    ) {
      this.getDetailsByTagID(this.searchObj.searchValue);
    } else {
      this.ownerDS
        .getOwnerByMobile(
          this.searchObj.searchValue,
          searchObj?.ownerType === OwnerType.nonIndividual
        )
        .subscribe(
          (res) => {
            this.isLoadingSpinner = false;
            if (!(res instanceof Array) || res?.length === 0) {
              this.healthService.handleError({
                title: this.translatePipe.transform('common.info_label'),
                message: this.translatePipe.transform(
                  'animalTreatmentSurgery.no_data_found_please_register_the_owner'
                ),
                primaryBtnText:
                  this.translatePipe.transform('common.ok_string'),
              });
              return;
            }
            this.showDraft = false;
            this.isLoadingSpinner = false;

            if (res.length === 1) {
              this.showOwnerDetails(<any>res[0]?.ownerId);
            } else {
              this.isOwnersListVisible = true;
              this.ownerDataSource.data = res;
            }
          },
          () => (this.isLoadingSpinner = false)
        );
    }
  }

  showOwnerDetails(ownerId: number | string) {
    this.isLoadingSpinner = true;
    this.healthService
      .getOwnerDetailsPageWise(
        ownerId,
        this.searchObj.ownerType,
        this.animalPageIndex,
        this.animalPageSize
      )
      .subscribe(
        (res) => {
          this.ownerDetailsByID = res;
          this.isOwnersListVisible = false;
          this.ownerDetailsSection = true;
          this.animalDetailsSectionVisible = true;
          this.tableDataSource.data = res?.animalsList ?? [];
          this.isLoadingSpinner = false;
          this.animalsCount = res.animalsCount;
        },
        () => (this.isLoadingSpinner = false)
      );
  }

  animalSelected(event: Event) {
    this.selectedAnimalId = (<HTMLInputElement>event.target).value;
  }

  onReset(resetAll = true) {
    this.showDraft = true;
    this.isOwnerDetailsSectionVisible = false;
    this.animalDetailsSectionVisible = false;
    this.isOwnersListVisible = false;
    this.ownerDataSource.data = [];
    this.tableDataSource.data = [];
    this.postMortemDetails = [];
    this.isPostMortemDetails = false;
    this.selectedAnimalId = null;
    this.tableDataSource.paginator = null;
    this.animalPageIndex = 0;
    this.animalPageSize = 5;
    this.animalsCount = 0;
    if (resetAll) {
      this.ownerTypeCd = OwnerType.individual;
      this.router.navigate(['.'], { relativeTo: this.route });
    }
  }

  onPageAnimalPageChange(event: PageEvent) {
    this.animalPageIndex = event.pageIndex;
    this.animalPageSize = event.pageSize;
    this.showOwnerDetails(this.ownerDetailsByID?.ownerId);
  }


  // searchResults(mobNo: string) {
  //   this.errorMessage = '';

  //   if (this.searchForm.invalid) {
  //     this.searchForm.markAllAsTouched();
  //     if (this.searchForm.get('searchValue')?.hasError('required')) {
  //       this.errorMessage = this.translatePipe.transform(
  //         this.validationsMsg.required
  //       );
  //     } else if (this.searchForm.get('searchValue')?.hasError('pattern')) {
  //       this.errorMessage = this.translatePipe.transform(
  //         this.validationsMsg.validTagId
  //       );
  //     }
  //     return;
  //   } else if (
  //     mobNo.length !== 8 &&
  //     mobNo.length !== 11 &&
  //     mobNo.length !== 12
  //   ) {
  //     this.errorMessage = this.translatePipe.transform(
  //       this.validationsMsg.validTagId
  //     );
  //     this.searchForm.markAllAsTouched();

  //     return;
  //   }

  //   this.getDetailsByTagID(mobNo);
  // }

  viewReport(animalId: number) {
    this.isLoadingSpinner = true;
    this.postmortemService.downloadPostMortemReport(animalId).subscribe(
      (res: any) => {
        this.isLoadingSpinner = false;
        // const fileName = res.headers
        //   .get('Content-Disposition')
        //   .split('; ')[1]
        //   .split('=')[1];
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
              primaryBtnText: this.translatePipe.transform('common.ok_string'),
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

  navigateToAddPostMortem() {
    this.isLoadingSpinner = true;
    this.postmortemService.getPostmortemDetail(this.selectedAnimalId).subscribe(
      (res) => {
        this.isLoadingSpinner = false;
        if (res.postmortemDetails == null) {
          this.router.navigate(['add-post-mortem'], {
            queryParams: { animalId: this.selectedAnimalId },
            relativeTo: this.route,
          });
          return;
        }
        // this.displayedColumns.shift();
        this.tableDataSource.data = this.tableDataSource.data.filter(
          (d) => d.animalId == this.selectedAnimalId
        );
        this.postmortemDetailsRes = res;
        this.postMortemDetails = [{ ...res.postmortemDetails, ...res }];
        this.isPostMortemDetails = true;
        this.isOwnerDetailsSectionVisible = false;
      },
      () => (this.isLoadingSpinner = false)
    );

    // if (this.postmortemDetailsRes.animalDetails.animalStatusCd !== 3) {
    //   this.dialog.open(TreatmentResponseDialogComponent, {
    //     data: {
    //       primaryBtnText: this.translatePipe.transform('common.ok_string'),
    //       title: this.translatePipe.transform(
    //         'errorMsg.cannot_perform_postmortem'
    //       ),
    //       message: this.translatePipe.transform('errorMsg.animal_is_not_dead'),
    //       icon: 'assets/images/info.svg',
    //     },
    //     panelClass: 'common-info-dialog',
    //   });
    //   return;
    // }
  }

  // resetValue() {
  //   this.searchForm.reset();
  //   this.ownerDetailsSection = false;
  //   this.animalDetailsSectionVisible = false;
  //   this.showDraft = true;
  // }

  getAnimalAge(monthCount: number) {
    return this.treatmentService.getWords(monthCount);
  }

  formatDate(date: string) {
    return moment(date).format('DD/MM/YYYY');
  }

  onOpenDraft(draft: { draftId: number; tagId: number; animalId: number }) {
    this.router.navigate(['add-post-mortem'], {
      relativeTo: this.route,
      queryParams: {
        animalId: draft.animalId,
        loadDraft: true,
      },
    });
  }

  viewAnimalHistory(element) {
    this.healthService.viewAnimalHistory(element, 7);
  }

  openOtpDialog(actionPerformed: string) {
    const dialogRef = this.dialog.open(OtpDialogComponent, {
      data: {
        isDisplayIcon: actionPerformed == 'registration' ? false : true,
        ownerId:
          actionPerformed == 'registration'
            ? this.ownerData?.ownerId
            : this.ownerDetailsByID?.ownerId,
        header:
          'Owner Id:' +
          (actionPerformed == 'registration'
            ? String(this.ownerData?.ownerId)
            : String(this.ownerDetailsByID?.ownerId)),
        heading:
          actionPerformed == 'registration'
            ? this.translatePipe.transform(
              'animalTreatmentSurgery.owner_registered_successfully'
            )
            : this.translatePipe.transform('animalTreatmentSurgery.owner_ver'),
        message: this.translatePipe.transform(
          'animalTreatmentSurgery.activate_account'
        ),
        link: '/dashboard/animal-treatment-surgery',
        name: 'ownerRegistrationSuccess',
        otp: '1234',
        ownerMobileNo:
          actionPerformed == 'registration'
            ? this.ownerInfoForm.get('ownerMobileNo')?.value
            : String(this.ownerDetailsByID?.ownerMobileNo),
      },
      width: '500px',
    });
    dialogRef.componentInstance.onClosed.subscribe(() => {
      if (this.ownerDS.getOwnerRegFlag()) {
        this.showOwnerDetails(
          actionPerformed == 'registration'
            ? this.ownerData?.ownerId
            : this.ownerDetailsByID?.ownerId
        );
        this.ownerDS.setOwnerRegFlag(false);
      }
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (this.ownerDS.getOwnerRegFlag()) {
        this.showOwnerDetails(
          actionPerformed == 'registration'
            ? this.ownerData?.ownerId
            : this.ownerDetailsByID?.ownerId
        );
        this.ownerDS.setOwnerRegFlag(false);
      }
    });
  }


  updateLabResults(postmortemId: number) {
    this.isLoadingSpinner = true;
    this.postmortemService
      .getSampleDetails(postmortemId)
      .subscribe((response: any) => {
        this.isLoadingSpinner = false;
        const dialogRef = this.dialog.open(UpdateLabComponent, {
          position: {
            right: '0px',
            top: '0px',
          },
          data: {
            data: { sampleDetails: response },
            animal: this.postmortemDetailsRes.animalDetails,
          },
          width: '600px',
          height: '100vh',
          panelClass: 'custom-dialog-container',
        });
        dialogRef
          .afterClosed()
          .pipe(
            filter((res) => !!res),
            switchMap((res) => {
              return this.dialog
                .open(TreatmentResponseDialogComponent, {
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
                })
                .afterClosed();
            })
          )
          .subscribe(
            (res: boolean) => {
              this.onSearch({ searchValue: this.searchObj.searchValue } as any);

              // this.getCurrentRoute();
            },
            () => (this.isLoadingSpinner = false)
          );
      });
    return;
  }

  searchInTable(event: KeyboardEvent) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableDataSource.filter = filterValue.trim().toLowerCase();
    if (this.tableDataSource.paginator) {
      this.tableDataSource.paginator.firstPage();
    }
  }

  backToOwnerList() {
    this.animalDetailsSectionVisible = false;
    this.isOwnerDetailsSectionVisible = false;
    this.isOwnersListVisible = true;
    this.selectedAnimalId = null;
  }
}
