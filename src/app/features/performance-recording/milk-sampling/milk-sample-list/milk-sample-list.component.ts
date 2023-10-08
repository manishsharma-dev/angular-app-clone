import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { HealthService } from 'src/app/features/animal-health/health.service';
import { RegisterOwner } from 'src/app/features/animal-management/owner-registration/models-owner-reg/register-owner.model';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { MasterConfig } from 'src/app/shared/master.config';
import { AnimalRegistrationList } from 'src/app/shared/shareService/model/owner.detail';
import { setEncryptedData } from 'src/app/shared/shareService/storageData';
import { SnackBarMessage } from 'src/app/shared/snack-bar';
import { PrService } from '../../pr.service';
import { MilkSamplingService } from '../milk-sampling.service';
import { SampleReportComponent } from '../sample-report/sample-report.component';
import moment from 'moment';
import { ViewOrganizationComponent } from 'src/app/features/animal-management/animal-registration/view-organization/view-organization.component';
import { EditOwnerDetailsComponent } from 'src/app/features/animal-management/owner-registration/edit-owner-details/edit-owner-details.component';
import { OwnerDetailsService } from 'src/app/features/animal-management/owner-registration/owner-details.service';
import { AnimalDetailService } from 'src/app/features/animal-management/animal-registration/animal-details/animal-detail.service';
import { BreedingUpdateSamplesComponent } from '../../components/breeding-update-samples/breeding-update-samples.component';
import { TreatmentResponseDialogComponent } from 'src/app/features/animal-health/treatment-response-dialog/treatment-response-dialog.component';
import {
  OwnerType,
  SearchValue,
} from 'src/app/shared/common-search-box/common-search-box.component';

@Component({
  selector: 'app-milk-sample-list',
  templateUrl: './milk-sample-list.component.html',
  styleUrls: ['./milk-sample-list.component.css'],
  providers: [TranslatePipe],
})
export class MilkSampleListComponent implements OnInit {
  orgId: number = null;
  isOwnerIndividual = true;
  masterConfig = MasterConfig;
  isTableVisible: boolean = false;
  ownerInfoForm!: FormGroup;
  animalDetailsSection: boolean = false;
  milkRecordingSection = false;
  errorMessage: string = '';
  // searchForm!: FormGroup;
  currentDate: string = '';
  isLoadingSpinner: boolean = false;
  ownerDetailsLength: number = 0;
  selectedTagId: number;
  animalpregnancyStatus: any;
  ownerData!: RegisterOwner;
  ownerRegistrationFlag: boolean = false;
  animalHistoryDetail: any;
  animal: any;
  selectedMrSample: any = null;
  mrdisplayedColumns: string[] = [
    'radio',
    'recordingNo',
    'mrDate',
    'morningYield',
    'afternoonYield',
    'eveningYield',
    'totalYield',
    'daysInMilk',
    'result',
  ];
  animalColumns: string[] = [
    'radio',
    '#',
    'tagId',
    'species',
    'animalCategory',
    'breedDesc',
    'ageInMonths',
    'pregnancyStatus',
    'milkingStatus',
    'currentLactationNo',
    'isElite',
  ];
  tableDataSource = new MatTableDataSource<AnimalRegistrationList | any>([]);
  @Output()
  emitFunctionOfParent: EventEmitter<any> = new EventEmitter<any>();
  latestBreeding: any;
  animalData: any = [];
  noOfActiveAnimals: number = 0;
  animalDetail: any = [];
  isSampleIdSearchTableVisible = false;
  sampleDetails = [];
  ownerDetailsByID: any = {};
  clickedOwnerName = '';
  clickedOwnerMobNo = '';
  ownerDetailsSection = false;
  isAnimalTabVisible = false;
  selectedAnimalTagId = 0;
  selectedAnimal: any = null;
  animalListTable = false;
  orgsList = [];
  searchValue: SearchValue;

  animalDetailsColumns = [
    'tagId',
    'animalCategory',
    'species',
    'breed',
    'age',
    'pregnancyStatus',
    'currentLactationNo',
    'milkingStatus',
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
  ownerDataSource = new MatTableDataSource<any>([]);
  ownerTypeCd = OwnerType.individual;

  @ViewChild('paginatorRef') set paginator(p: MatPaginator) {
    this.ownerDataSource.paginator = p;
  }

  @ViewChild(MatSort) set sort(s: MatSort) {
    this.ownerDataSource.sort = s;
  }

  @ViewChild('animalPaginator') set animalListPaginator(p: MatPaginator) {
    this.tableDataSource.paginator = p;
  }

  @ViewChild(MatSort) set animalListSort(s: MatSort) {
    this.tableDataSource.sort = s;
  }

  constructor(
    public dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private prService: PrService,
    private healthService: HealthService,
    private milkSamplingService: MilkSamplingService,
    private translatePipe: TranslatePipe,
    private ownerDS: OwnerDetailsService,
    private animalDS: AnimalDetailService
  ) {}

  ngOnInit(): void {
    // this.isLoadingSpinner = true;
    // this.animalDS.getOrgs().subscribe(
    //   (data) => {
    //     this.orgsList = data;
    //     this.isLoadingSpinner = false;
    //   },
    //   () => (this.isLoadingSpinner = false)
    // );
    // this.initSearchForm();
  }

  searchResults(searchValue: SearchValue) {
    this.searchValue = searchValue;
    this.isSampleIdSearchTableVisible = false;
    this.milkRecordingSection = false;
    this.animalDetailsSection = false;
    this.isAnimalTabVisible = false;
    this.ownerRegistrationFlag = false;
    this.animalDetailsSection = false;
    this.animalListTable = false;
    this.ownerDetailsSection = false;
    this.isTableVisible = false;
    const sampleIdRegex = new RegExp('^(?=.*[a-zA-Z])(?=.*[0-9])[A-Za-z0-9]+$');

    this.errorMessage = '';
    if (
      (searchValue.searchValue.length == 8 ||
        searchValue.searchValue.length == 11 ||
        searchValue.searchValue.length == 12) &&
      !isNaN(+searchValue)
    ) {
      this.getMrHistory(searchValue);
    } else {
      this.isLoadingSpinner = true;
      this.errorMessage = '';
      if (
        searchValue?.searchValue?.length === 12 &&
        sampleIdRegex.test(searchValue?.searchValue)
      ) {
        this.getSampleDetails(searchValue?.searchValue);
      } else {
        this.prService.getSearchDetails(searchValue).subscribe(
          (data) => {
            this.ownerDataSource.data = data;
            this.ownerDetailsLength = this.ownerDataSource.data.length;
            if (this.ownerDataSource.data.length > 1) {
              this.isTableVisible = true;
              this.ownerDetailsSection = false;
              this.animalListTable = false;
            } else if (this.ownerDataSource.data.length == 1) {
              this.isTableVisible = false;
              this.ownerDetailsByID = data[0];
              this.isLoadingSpinner = false;
              this.ownerTypeCd =
                this.ownerDetailsByID?.ownerTypeCd ?? OwnerType.organization;
              if (this.ownerTypeCd === OwnerType.organization) {
                this.orgId = this.ownerDetailsByID?.orgId;
              }
              if (
                this.ownerDetailsByID.animalsList &&
                this.ownerDetailsByID.animalsList.length
              ) {
                for (let animal of this.ownerDetailsByID.animalsList) {
                  if (animal.ageInMonths) {
                    animal.ageInMonths = this.prService.getWords(
                      animal.ageInMonths
                    );
                  }
                  animal['breedDesc'] =
                    animal.breedAndExoticLevels &&
                    animal.breedAndExoticLevels.length > 1
                      ? 'Cross Breed'
                      : animal.breedAndExoticLevels &&
                        animal.breedAndExoticLevels.length
                      ? animal.breedAndExoticLevels[0].breed
                      : '--';
                }
              }
              this.tableDataSource.data =
                this.ownerDetailsByID.animalsList ?? [];
              this.clickedOwnerName =
                this.ownerDetailsByID.ownerFirstName +
                ' ' +
                this.ownerDetailsByID?.ownerMiddleName +
                ' ' +
                this.ownerDetailsByID.ownerLastName;
              this.clickedOwnerMobNo = this.ownerDetailsByID?.ownerMobileNo;

              this.isTableVisible = false;
              this.ownerDetailsSection = true;
              // this.animalDetailsSection = true;
              this.animalListTable = false;
              // if (this.isOwnerIndividual) {
              //   this.getOwnerDetailsByID(this.ownerDataSource.data[0].ownerId);
              // } else {
              this.ownerDetailsByID = data[0];
              // this.isLoadingSpinner = false;
              if (
                this.ownerDetailsByID.animalsList &&
                this.ownerDetailsByID.animalsList.length
              ) {
                for (let animal of this.ownerDetailsByID.animalsList) {
                  if (animal.ageInMonths) {
                    animal.ageInMonths = this.prService.getWords(
                      animal.ageInMonths
                    );
                  }
                  animal['breedDesc'] =
                    animal.breedAndExoticLevels &&
                    animal.breedAndExoticLevels.length > 1
                      ? 'Cross Breed'
                      : animal.breedAndExoticLevels &&
                        animal.breedAndExoticLevels.length
                      ? animal.breedAndExoticLevels[0].breed
                      : '--';
                }
              }
              this.tableDataSource.data =
                this.ownerDetailsByID.animalsList ?? [];
              this.clickedOwnerName =
                this.ownerDetailsByID.ownerFirstName +
                ' ' +
                this.ownerDetailsByID?.ownerMiddleName +
                ' ' +
                this.ownerDetailsByID.ownerLastName;
              this.clickedOwnerMobNo = this.ownerDetailsByID?.ownerMobileNo;

              this.isTableVisible = false;
              this.ownerDetailsSection = true;
              this.animalListTable = true;
              // }
            } else {
              this.checkSearchValidity();
            }
            this.isLoadingSpinner = false;
          },
          (err) => (this.isLoadingSpinner = false)
        );
      }
    }
  }

  getSampleDetails(mobNo) {
    this.isLoadingSpinner = true;
    this.milkSamplingService.getMilkSampleDetails([mobNo]).subscribe(
      (res) => {
        this.isLoadingSpinner = false;
        this.milkRecordingSection = false;
        this.animalDetailsSection = false;
        for (const sample of res) {
          if (
            (sample.labTesting &&
              sample.labTesting.breedingExaminationType !== 1) ||
            (sample.onspotTesting &&
              sample.onspotTesting.breedingExaminationType !== 1)
          ) {
            this.dialog.open(ConfirmationDialogComponent, {
              data: {
                title: this.translatePipe.transform(
                  'performanceRecording.incorrect_sampleid'
                ),
                message: this.translatePipe.transform(
                  'performanceRecording.sample_id_does_not_exist_please_enter_the_correct_sample_id'
                ),
                icon: 'assets/images/info.svg',
                primaryBtnText:
                  this.translatePipe.transform('common.ok_string'),
              },
              panelClass: 'common-info-dialog',
            });
            // this.searchForm.reset();
            return;
          }
        }
        if (res[0].onspotTesting) {
          const sample = res[0].onspotTesting;
          this.sampleDetails = [
            {
              ...sample,
              sampleId: sample.sampleId,
              tagId: sample.tagId,
              testDate: sample.sampleCollectionDate,
              testType: 'On Spot Testing',
              examinationType: 'Milk Analysis',
              breedingExaminationSubtypeValue: 'MCA',
            },
          ];
        } else if (res[0].labTesting) {
          const sample = res[0].labTesting;
          this.sampleDetails = [
            {
              ...sample,
              sampleId: sample.sampleId,
              tagId: sample.tagId,
              testDate: sample.sampleCollectionDate,
              testType: 'Lab Testing',
              examinationType: 'Milk Analysis',
              breedingExaminationSubtypeValue: 'MCA',
            },
          ];
        }
        this.isSampleIdSearchTableVisible = true;
      },
      () => (this.isLoadingSpinner = false)
    );
  }

  getMrHistory(mobNo) {
    this.isLoadingSpinner = true;
    this.prService.getMRHistory(mobNo).subscribe(
      (data: any) => {
        this.isSampleIdSearchTableVisible = false;
        this.animalHistoryDetail = data;
        this.ownerDetailsSection = false;
        const breedingDetail = this.animalHistoryDetail?.mrHistoryList ?? [];
        // if (breedingDetail && breedingDetail.length) {
        this.tableDataSource.data = breedingDetail;
        // }
        this.animal = data?.animalResponse;
        this.milkRecordingSection = true;
        this.animalDetailsSection = true;
        this.animalListTable = false;
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  getOwnerDetailsByID(ownerData: any) {
    this.isLoadingSpinner = true;
    this.prService
      .getSearchDetails({
        searchValue: ownerData?.ownerId,
        ownerType: ownerData?.ownerTypeCd,
      })
      .subscribe(
        (data) => {
          this.ownerDetailsByID = data[0];
          this.isLoadingSpinner = false;
          if (
            this.ownerDetailsByID.animalsList &&
            this.ownerDetailsByID.animalsList.length
          ) {
            for (let animal of this.ownerDetailsByID.animalsList) {
              if (animal.ageInMonths) {
                animal.ageInMonths = this.prService.getWords(
                  animal.ageInMonths
                );
              }
              animal['breedDesc'] =
                animal.breedAndExoticLevels &&
                animal.breedAndExoticLevels.length > 1
                  ? 'Cross Breed'
                  : animal.breedAndExoticLevels &&
                    animal.breedAndExoticLevels.length
                  ? animal.breedAndExoticLevels[0].breed
                  : '--';
            }
          }
          this.tableDataSource.data = this.ownerDetailsByID.animalsList ?? [];
          this.clickedOwnerName =
            this.ownerDetailsByID.ownerFirstName +
            ' ' +
            this.ownerDetailsByID?.ownerMiddleName +
            ' ' +
            this.ownerDetailsByID.ownerLastName;
          this.clickedOwnerMobNo = this.ownerDetailsByID?.ownerMobileNo;

          this.isTableVisible = false;
          this.ownerDetailsSection = true;
          this.animalDetailsSection = false;
          this.animalListTable = true;
        },
        () => {
          this.isLoadingSpinner = false;
          this.tableDataSource.data = [];
          this.isTableVisible = false;
          this.ownerDetailsSection = false;
          this.animalDetailsSection = false;
          this.isAnimalTabVisible = false;
        }
      );
  }

  resetValue() {
    this.errorMessage = '';
    // this.searchForm.reset();
    this.ownerRegistrationFlag = false;
    this.milkRecordingSection = false;
    this.animalDetailsSection = false;
    this.animalListTable = false;
    this.isSampleIdSearchTableVisible = false;
    this.ownerDetailsSection = false;
    this.isTableVisible = false;
    this.ownerTypeCd = OwnerType.individual;
    this.orgId = null;
  }

  // private initSearchForm(): void {
  //   this.searchForm = this._formBuilder.group({
  //     searchValue: [null, [Validators.required]],
  //   });
  // }

  viewReport(sample: { id: string; recordingPeriod: string }[]) {
    this.isLoadingSpinner = true;
    this.milkSamplingService
      .getMilkSampleDetails(sample?.map((sample) => sample?.id))
      .subscribe((res) => {
        this.isLoadingSpinner = false;
        this.dialog.open(SampleReportComponent, {
          data: res?.map((r, i) => ({
            labTesting:
              r.labTesting != null ? { ...sample[i], ...r.labTesting } : null,
            onspotTesting:
              r.onspotTesting != null
                ? { ...sample[i], ...r.onspotTesting }
                : null,
          })),
          position: {
            right: '0px',
            top: '0px',
          },
          width: '600px',
          height: '100vh',
          panelClass: 'custom-dialog-container',
        });
      });
  }

  navigateToAddSample() {
    if (
      this.animalHistoryDetail?.animalResponse &&
      // this.animalHistoryDetail?.animalResponse['milkingStatus'] == 'In Milk' &&
      this.animalHistoryDetail?.animalResponse?.animalStatusCd === 1
    ) {
      setEncryptedData(
        {
          id: {
            ...this.selectedMrSample,
            animalId: this.animal.animalId,
          },
        },
        'selectedMrSample'
      );
      this.router.navigate(['..', 'add-sample'], { relativeTo: this.route });
    } else {
      if (this.animalHistoryDetail?.animalResponse?.animalStatusCd !== 1) {
        new SnackBarMessage(this._snackBar).onSucessMessage(
          this.translatePipe.transform('errorMsg.animal_not_active'),
          this.translatePipe.transform('common.ok_string'),
          'center',
          'top',
          'red-snackbar'
        );
      }
      // else if (
      //   this.animalHistoryDetail?.animalResponse['milkingStatus'] !== 'In Milk'
      // ) {
      //   new SnackBarMessage(this._snackBar).onSucessMessage(
      //     this.translatePipe.transform('errorMsg.animal_is_not_in_milk'),
      //     this.translatePipe.transform('common.ok_string'),
      //     'center',
      //     'top',
      //     'red-snackbar'
      //   );
      // }
    }
  }

  selectMrSample(event: Event, element: any) {
    this.selectedMrSample = element;
  }

  getAnimalAge(ageInMonths: number) {
    return this.healthService.getWords(ageInMonths);
  }

  onUpdateSample() {
    this.searchResults(this.searchValue);
  }

  getTranslation(key: string) {
    return this.translatePipe.transform(key);
  }

  formatDate(date: string) {
    if (date) {
      return moment(new Date(date)).format('DD/MM/YYYY');
    }
    return null;
  }

  viewOrgDetailsDialog() {
    const dialog = this.dialog.open(ViewOrganizationComponent, {
      data: { orgData: this.ownerDetailsByID },
      width: '500px',
      height: '100vh',
      panelClass: 'custom-dialog-container',
      position: {
        right: '0px',
        top: '0px',
      },
    });
  }

  editOwnerDialog(isView?: boolean) {
    const dialogRef = this.dialog.open(EditOwnerDetailsComponent, {
      data: {
        ownerData: this.ownerDetailsByID,
        redirectLink: '/dashboard/animal-treatment-surgery',
        isView: isView ? true : false,
      },
      width: '500px',
      height: '100vh',
      panelClass: 'custom-dialog-container',
      position: {
        right: '0px',
        top: '0px',
      },
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (this.ownerDS.geteditDetailsFlag()) {
        this.searchResults(this.searchValue);
        this.ownerDS.seteditDetailsFlag(false);
      }
    });
  }

  checkSearchValidity() {
    this.healthService.handleError({
      title: this.translatePipe.transform('common.info_label'),
      message: this.translatePipe.transform(
        'animalTreatmentSurgery.no_data_found_please_register_the_owner'
      ),
      primaryBtnText: 'Ok',
    });
    this.isTableVisible = false;
    this.ownerDetailsSection = false;
    this.animalDetailsSection = false;
  }

  openOtpDialog(key: any) {}

  searchInTable(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableDataSource.filter = filterValue.trim().toLowerCase();
    if (this.tableDataSource.paginator) {
      this.tableDataSource.paginator.firstPage();
    }
  }

  animalSelected(event: Event, animal: any) {
    this.selectedAnimalTagId = +(event.target as HTMLSelectElement).value;
    this.selectedAnimal = animal;
  }

  isSampleAvailableForPeriod(element: any, recordingPeriod: number) {
    return !!element?.sample?.find(
      (sample) => sample.recordingPeriod == recordingPeriod
    );
  }

  showViewReport(samples: Sample[]) {
    return (
      samples?.length && samples.some((sample) => sample.samplingStatus == 2)
    );
  }

  updateSamples(samples: Sample[]) {
    this.dialog
      .open(BreedingUpdateSamplesComponent, {
        position: {
          right: '0px',
          top: '0px',
        },
        data: samples.map((sample) => ({
          ...this.animal,
          ...sample,
          sampleId: sample.id,
          breedingExaminationType: 1,
        })),
        width: '600px',
        height: '100vh',
        panelClass: 'custom-dialog-container',
      })
      .afterClosed()
      .subscribe((res) => {
        if (!res) {
          return;
        }
        this.searchResults(this.searchValue);
        this.dialog.open(TreatmentResponseDialogComponent, {
          data: {
            title: 'Info',

            icon: 'assets/images/info.svg',
            message: 'Lab results saved successfully',
            primaryBtnText: 'OK',
            secondaryBtnText: '',
          },
          panelClass: 'common-info-dialog',
        });
      });
  }

  backToOwnerList() {
    this.isTableVisible = true;
    this.ownerDetailsSection = false;
    this.animalDetailsSection = false;
    this.animalListTable = false;
    this.selectedAnimalTagId = null;
    this.selectedAnimal = null;
  }
}

interface Sample {
  samplingStatus: string | number;
  id: string;
  recordingPeriod: string | number;
  testingLocation: string | number;
}
