import { DatePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { MasterConfig } from 'src/app/shared/master.config';
import { OtpDialogComponent } from 'src/app/shared/otp-dialog/otp-dialog.component';
import { CountryService } from 'src/app/shared/shareService/country-service.service';
// import { DistrictList } from 'src/app/shared/shareService/model/district.model';
// import { StateList } from 'src/app/shared/shareService/model/state.model';
import { TehsilList } from 'src/app/shared/shareService/model/tehsil.model';
import { VillageList } from 'src/app/shared/shareService/model/village.model';
import {
  MembershipNumberValidation,
  // SearchValidation,
  TagIdSearchValidation,
} from 'src/app/shared/utility/validation';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { AnimalManagementService } from '../../animal-management/animal-registration/animal-management.service';
import { AddDetailsDialogComponent } from '../../animal-management/owner-registration/add-details-dialog/add-details-dialog.component';
import { EditOwnerDetailsComponent } from '../../animal-management/owner-registration/edit-owner-details/edit-owner-details.component';
import { CommonData } from '../../animal-management/owner-registration/models-owner-reg/common-data.model';
import { OwnerData } from '../../animal-management/owner-registration/models-owner-reg/get-owner-details.model';
import {
  CompleteOwnerDetails,
  AnimalRegistrationList,
} from '../../animal-management/owner-registration/models-owner-reg/get-ownerby-ownerID.model';
import { RegisterOwner } from '../../animal-management/owner-registration/models-owner-reg/register-owner.model';
import { InstitutionName } from '../../animal-management/owner-registration/models-owner-reg/village-institution-name';
import { OwnerDetailsService } from '../../animal-management/owner-registration/owner-details.service';
import { AnimalData } from '../animal-treatment/animal-treatment.component';
import { AnimalTreatmentService } from '../animal-treatment/animal-treatment.service';
import { HealthService } from '../health.service';
import { TreatmentResponseDialogComponent } from '../treatment-response-dialog/treatment-response-dialog.component';
import { DiseaseTestingService } from './disease-testing.service';
import { SearchValidation } from '../../performance-recording/search-validator';
import { OwnerType } from 'src/app/shared/common-search-box/common-search-box.component';

@Component({
  selector: 'app-disease-testing',
  templateUrl: './disease-testing.component.html',
  styleUrls: ['./disease-testing.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [TranslatePipe],
})

export class DiseaseTestingComponent implements OnInit {
  masterConfig = MasterConfig;
  ownerTypeCd = OwnerType.individual;
  @Input() firFlag;
  @Output() newFormSelected = new EventEmitter();
  //stateList: StateList[] = [];
  isTableVisible: boolean = false;
  //districtList!: DistrictList[];
  tehsilList: TehsilList[] = [];
  villageList: VillageList[] = [];
  langData: string = '';
  isAnimalTabVisible: boolean = false;
  ownerInfoForm!: FormGroup;
  ownerDetailsSection: boolean = false;
  animalDetailsSection: boolean = false;
  additionalDetailsCounter: number = 0;
  errorMessage: string = '';
  searchForm!: FormGroup;
  searchBy: string = 'individual';
  individualOwner: boolean = true;
  cities: string[] = [];
  ownerDetailsRecord: any[] = [];
  ownerDetailsByID!: any;
  clickedOwnerName: string = '';
  clickedOwnerMobNo: number = 0;
  clickedOwnerFather: string = '';
  currentDate: string = '';
  ownerRegistrationFlag: boolean = false;
  isLoadingSpinner: boolean = false;
  ownerData!: RegisterOwner;
  ownerDetailsLength: number = 0;
  institutionList: CommonData[] = [];
  villageInstitutionNames: InstitutionName[] = [];
  private paginator!: MatPaginator;
  private sort!: MatSort;
  selectedAnimalId!: number;
  ownerId?: number;
  noOfActiveAnimals = 0;
  displayedColumns: string[] = [
    'radio',
    'tagId',
    'taggingDate',
    'category',
    'animalCategory',
    'sex',
    'age',
    'status',
    'previousResults',
    'healthHistory',
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
    'ageInDays',
    'animalStatusCd',
    'animalStatus',
    'animalId',
    'animalName',
    'animalCategory'
  ];
  tableDataSource = new MatTableDataSource<AnimalRegistrationList>();
  selectedAnimal: AnimalData;
  animalPageIndex = 0;
  animalPageSize = 5;
  animalsCount = 0;
  constructor(
    public dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private countryService: CountryService,
    private ownerDS: OwnerDetailsService,
    private datePipe: DatePipe,
    private treatmentService: AnimalTreatmentService,
    private route: ActivatedRoute,
    private animalMS: AnimalManagementService,
    private healthService: HealthService,
    private readonly translateService: TranslateService,
    private router: Router,
    private translatePipe: TranslatePipe
  ) { }

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }

  @ViewChild('animalPaginator') animalPaginator: MatPaginator;

  ngOnInit(): void {
    this.searchForm = this._formBuilder.group({
      ownerType: [this.searchBy],
      searchValue: ['', [Validators.required, TagIdSearchValidation]],
    }, { validators: [SearchValidation(false, false)] });

    this.route.queryParams.subscribe((params) => {
      if (params['ownerId']) {
        this.ownerId = params['ownerId'];
        this.showOwnerDetails(params['ownerId']);
      }
    });
  }

  onSelectingSearchBy(event: Event) {
    this.searchBy = (event.target as HTMLInputElement)?.value;
    this.searchForm.get('searchValue').reset();
    this.isAnimalTabVisible = false;
    this.isTableVisible = false;
    this.ownerDetailsSection = false;
    this.animalDetailsSection = false;
    this.errorMessage = '';
    if (this.searchBy == 'individual') {
      this.individualOwner = true;
    } else {
      this.individualOwner = false;
    }
  }

  setDataSourceAttributes() {
    this.tableDataSource.paginator = this.paginator;
    this.tableDataSource.sort = this.sort;
  }

  // getOwnerDetailsByID(ownerId: string) {
  //   this.isLoadingSpinner = true;
  //   this.ownerDS.getOwnerByOwnerID(ownerId).subscribe(
  //     (data: any) => {
  //       this.ownerDetailsByID = data;
  //       this.isLoadingSpinner = false;
  //       if (
  //         this.ownerDetailsByID.animalsList &&
  //         this.ownerDetailsByID.animalsList.length
  //       ) {
  //         for (let animal of this.ownerDetailsByID.animalsList) {
  //           if (animal.ageInMonths) {
  //             animal.ageInMonths = this.getWords(animal.ageInMonths);
  //           }
  //           else if (animal.ageInDays) {
  //             animal.ageInMonths = `${animal.ageInDays}D`;
  //           }

  //           animal['breedDesc'] =
  //             animal.breedAndExoticLevels &&
  //               animal.breedAndExoticLevels.length > 1
  //               ? 'Cross Breed'
  //               : animal.breedAndExoticLevels &&
  //                 animal.breedAndExoticLevels.length
  //                 ? animal.breedAndExoticLevels[0].breed
  //                 : 'NA';
  //         }
  //       }
  //       this.tableDataSource = new MatTableDataSource(
  //         this.ownerDetailsByID.animalsList
  //       );
  //       this.setDataSourceAttributes();
  //       this.clickedOwnerName =
  //         this.ownerDetailsByID.ownerFirstName +
  //         ' ' +
  //         this.ownerDetailsByID?.ownerMiddleName +
  //         ' ' +
  //         this.ownerDetailsByID.ownerLastName;
  //       this.clickedOwnerMobNo = this.ownerDetailsByID?.ownerMobileNo;
  //       // this.clickedOwnerFather =
  //       //   this.ownerDetailsByID.fatherFirstName +
  //       //   ' ' +
  //       //   this.ownerDetailsByID.fatherMiddleName +
  //       //   ' ' +
  //       //   this.ownerDetailsByID.fatherLastName;
  //       this.isTableVisible = false;
  //       this.ownerDetailsSection = true;
  //       this.animalDetailsSection = true;
  //       //this.ownerDS.setOwnerDetailsTemp(this.ownerDetailsByID);
  //     },
  //     (err) => {
  //       this.isLoadingSpinner = false;
  //       this.tableDataSource.data = [];
  //       this.setDataSourceAttributes();
  //       this.isTableVisible = false;
  //       this.ownerDetailsSection = false;
  //       this.animalDetailsSection = false;
  //       this.isAnimalTabVisible = false;
  //     }
  //   );
  // }

  get searchInfo() {
    return this.searchForm.controls;
  }

  onPageAnimalPageChange(event: PageEvent) {
    this.animalPageIndex = event.pageIndex;
    this.animalPageSize = event.pageSize;
    this.showOwnerDetails(this.ownerDetailsByID?.ownerId);
  }

  searchResults(mobNo: string) {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      //this.ownerInfoForm.patchValue({ firstName: '', mobileNo: '' });

    } else {
      if (
        (mobNo.length == 8 || mobNo.length == 11 || mobNo.length == 12) &&
        !isNaN(+mobNo)
      ) {
        this.getDetailsByTagID(mobNo);
      } else {
        // if (
        //   (this.searchBy == 'individual' || this.searchBy == 'nonIndividual') &&
        //   // !String(mobNo).startsWith('1') &&
        //   mobNo.length == 15 &&
        //   !isNaN(Number(mobNo))
        // ) {
        //   this.errorMessage =
        //     this.translatePipe.transform('errorMsg.all_number_error');
        //   return;

        //   // } else if (
        //   //   this.searchBy == 'nonIndividual' &&
        //   //   // !String(mobNo).startsWith('3') &&
        //   //   mobNo.length == 15 &&
        //   //   !isNaN(Number(mobNo))
        //   // ) {
        //   //   this.errorMessage = this.translatePipe.transform(
        //   //     'common.nonIndvOwnerId'
        //   //   );
        //   // return;
        // }
        this.isLoadingSpinner = true;
        this.errorMessage = '';
        this.ownerDS.getOwnerByMobile(mobNo,
          this.searchBy == 'nonIndividual' ? true : false).subscribe(
            (data) => {
              this.isLoadingSpinner = false;
              this.ownerDetailsRecord = data;
              this.ownerDetailsLength = this.ownerDetailsRecord.length;
              if (this.ownerDetailsRecord.length > 1) {
                this.isTableVisible = true;
                this.ownerDetailsSection = false;
                this.animalDetailsSection = false;
              } else if (this.ownerDetailsRecord.length == 1) {
                this.isTableVisible = false;
                this.showOwnerDetails(this.ownerDetailsRecord[0].ownerId);
              } else {
                this.checkSearchValidity();
              }
            },
            (err) => {
              this.isLoadingSpinner = false;
              this.ownerDetailsSection = false;
              this.animalDetailsSection = false;
            }
          );
      }
    }
  }
  showOwnerDetails(ownerId: number | string) {
    this.isLoadingSpinner = true;
    this.healthService
      .getOwnerDetailsPageWise(
        ownerId,
        this.searchForm.get('ownerType')?.value === 'individual'
          ? OwnerType.individual
          : OwnerType.nonIndividual,
        this.animalPageIndex,
        this.animalPageSize
      )
      .subscribe(
        (res) => {
          this.ownerDetailsByID = res;
          this.isTableVisible = false;
          this.ownerDetailsSection = true;
          this.animalDetailsSection = true;
          this.tableDataSource.data = res?.animalsList ?? [];
          this.isLoadingSpinner = false;
          this.animalsCount = res.animalsCount;
        },
        () => (this.isLoadingSpinner = false)
      );
  }

  getDetailsByTagID(searchValue: string) {
    this.noOfActiveAnimals = 0;
    this.isLoadingSpinner = true;
    this.healthService.getDetailsByTagID(searchValue).subscribe(
      (searchResult: any) => {
        this.isLoadingSpinner = false;
        this.ownerDetailsByID = searchResult.ownerDetails;
        var animalList: any = <AnimalRegistrationList>{};
        for (let key of this.animalKeys) {
          animalList[key] = searchResult[key];
        }
        if (searchResult?.animalId) {
          if (
            searchResult.isLoanOnAnimal &&
            !searchResult?.animalStatus?.includes('Sold')
          ) {
            this.noOfActiveAnimals += 1;
          }
        }
        if (animalList.ageInMonths) {
          animalList.ageInMonths = this.getWords(animalList.ageInMonths);
        }
        if (searchResult.ownerDetails.ownerId) {
          this.searchForm.patchValue({
            ownerType: String(searchResult.ownerDetails.ownerId).startsWith('1')
              ? 'individual'
              : 'nonIndividual',
          });
          this.searchBy = String(searchResult.ownerDetails.ownerId).startsWith(
            '1'
          )
            ? 'individual'
            : 'nonIndividual';
          this.ownerDetailsSection = true;
          this.isAnimalTabVisible = true;
        }
        else if (animalList.ageInDays) {
          animalList.ageInMonths = `${animalList.ageInDays}D`;
        }
        if (searchResult.ownerDetails.ownerId) {
          this.ownerTypeCd = searchResult?.ownerDetails.ownerTypeCd;
          this.ownerDetailsSection = true;
          this.isAnimalTabVisible = true;
        } else {
          this.ownerTypeCd = OwnerType.organization;
          this.ownerDetailsSection = true;

          this.isAnimalTabVisible = true;
        }

        this.tableDataSource = new MatTableDataSource([animalList]);
        this.setDataSourceAttributes();

        this.animalsCount = 1;
        this.isTableVisible = false;
        this.ownerDetailsSection = true;
        this.animalDetailsSection = true;
        this.isAnimalTabVisible = true;
      },
      (error) => {
        this.isLoadingSpinner = false;
        this.tableDataSource.data = [];
        this.setDataSourceAttributes();
        this.ownerDetailsSection = false;
        this.animalDetailsSection = false;
        this.isAnimalTabVisible = false;
        this.isTableVisible = false;
      }
    );
  }

  animalSelected(event: Event, animal: AnimalData) {
    this.selectedAnimalId = +(event.target as HTMLSelectElement).value;
    this.selectedAnimal = animal;
  }

  checkSearchValidity() {
    this.healthService.handleError({
      title: this.translateService.instant('common.info_label'),
      message: this.translateService.instant(
        'animalTreatmentSurgery.no_data_found_please_register_the_owner'
      ),
      primaryBtnText: this.translateService.instant('common.ok_string'),
    });
    this.isTableVisible = false;
    this.ownerDetailsSection = false;
    this.animalDetailsSection = false;
  }

  // Form Functions
  spaceRestict(event: KeyboardEvent) {
    if (
      ((event.target as HTMLInputElement)?.selectionStart === 0 &&
        event.code === 'Space') ||
      ((event.target as HTMLInputElement)?.selectionEnd === 10 &&
        event.code === 'Space')
    ) {
      event.preventDefault();
    }
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
        this.showOwnerDetails(this.ownerDetailsByID?.ownerId);
        this.ownerDS.seteditDetailsFlag(false);
      }
    });
  }

  addInfoDialog() {
    const dialogRef = this.dialog.open(AddDetailsDialogComponent, {
      data: {
        ownerId: this.ownerDetailsByID?.ownerId,
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
      this.additionalDetailsCounter += 1;
      if (this.ownerDS.getAddDetailsFlag()) {
        this.showOwnerDetails(this.ownerDetailsByID?.ownerId);
        this.ownerDS.setAddDetailsFlag(false);
      }
    });
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
        link: '/dashboard/group-disease-testing',
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

  getStateList() {
    // this.countryService.getStates().subscribe((stateData: StateList[]) => {
    //   this.stateList = stateData;
    // });
    // this.villageList = [];
    // this.tehsilList = [];
    // this.districtList = [];
  }

  getDistricts(stateCode: Event) {
    // this.villageList = [];
    // this.tehsilList = [];
    // this.ownerInfoForm.patchValue({
    //   ownerAddressTehsilCd: '',
    //   ownerAddressCityVillageCd: '',
    // });
    // this.countryService
    //   .getDistrict(+(stateCode.target as HTMLInputElement)?.value)
    //   .subscribe((districtData: DistrictList[]) => {
    //     this.districtList = districtData.filter(
    //       (state) =>
    //         state.stateCode == (stateCode.target as HTMLInputElement)?.value
    //     );
    //   });
  }

  getTehsil(districtCode: Event) {
    // this.villageList = [];
    // this.countryService
    //   .getTehsil(+(districtCode.target as HTMLInputElement)?.value)
    //   .subscribe((tehsilData: TehsilList[]) => {
    //     this.tehsilList = tehsilData.filter(
    //       (tehsil) =>
    //         tehsil.districtCode ==
    //         (districtCode.target as HTMLInputElement)?.value
    //     );
    //   });
  }

  getVillage(tehsilCode: Event) {
    // this.countryService
    //   .getVillages(+(tehsilCode.target as HTMLInputElement)?.value)
    //   .subscribe((villageData: VillageList[]) => {
    //     this.villageList = villageData.filter(
    //       (village) =>
    //         village.tehsilCode == (tehsilCode.target as HTMLInputElement)?.value
    //     );
    //   });
  }

  getVillageInstName(event: Event) {
    // this.ownerDS
    //   .getVillageInstitutionName((event.target as HTMLInputElement)?.value)
    //   .subscribe((names) => {
    //     this.villageInstitutionNames = names;
    //   });
  }

  get ownerInfo() {
    return this.ownerInfoForm.controls;
  }

  get affiliatedAgencyDetails() {
    return (this.ownerInfoForm.controls.affiliatedAgency as FormGroup).controls;
  }

  getToday(): string {
    return new Date(sessionStorage.getItem('serverCurrentDateTime')).toISOString().split('T')[0];
  }

  getPastDate(): string {
    var tempDate = new Date(sessionStorage.getItem('serverCurrentDateTime'));
    tempDate.setFullYear(tempDate.getFullYear() - 150);
    this.currentDate = tempDate.toISOString().split('T')[0];
    return this.currentDate;
  }

  resetValue() {
    this.searchForm.reset();
    this.ownerRegistrationFlag = false;
    this.ownerDetailsSection = false;
    this.animalDetailsSection = false;
    this.tableDataSource.paginator = null;
    this.animalPageIndex = 0;
    this.animalPageSize = 5;
    this.animalsCount = 0;
  }

  onSelectingRadioButton(event: Event) {
    this.villageInstitutionNames = [];
    if ((event.target as HTMLInputElement)?.value == 'true') {
      this.ownerInfoForm
        .get('villageInstitutionType')
        ?.addValidators([Validators.required]);
      this.ownerInfoForm
        .get('villageInstitutionCode')
        ?.addValidators([Validators.required]);
      this.ownerInfoForm
        .get('membershipNumber')
        ?.addValidators([Validators.required, MembershipNumberValidation]);
    } else {
      this.ownerInfoForm.get('villageInstitutionType')?.clearValidators();
      this.ownerInfoForm.get('villageInstitutionCode')?.clearValidators();
      this.ownerInfoForm.get('membershipNumber')?.clearValidators();
      this.ownerInfoForm.get('villageInstitutionType')?.markAsUntouched();
      this.ownerInfoForm.get('villageInstitutionCode')?.markAsUntouched();
      this.ownerInfoForm.get('membershipNumber')?.markAsUntouched();
      this.ownerInfoForm.patchValue({
        villageInstitutionType: '',
        villageInstitutionCode: '',
        membershipNumber: '',
      });
    }
    this.ownerInfoForm.get('villageInstitutionType')?.updateValueAndValidity();
    this.ownerInfoForm.get('villageInstitutionCode')?.updateValueAndValidity();
    this.ownerInfoForm.get('membershipNumber')?.updateValueAndValidity();
  }

  validateForm() {
    // const formValue = this.ownerInfoForm.value;
    // formValue.ownerDateOfBirth = this.datePipe.transform(
    //   formValue.ownerDateOfBirth,
    //   'yyyy-MM-dd'
    // );
    // if (this.ownerInfoForm.invalid) {
    //   this.ownerInfoForm.markAllAsTouched();
    //   return;
    // } else {
    //   this.openOtpDialog();
    //   this.ownerDS
    //     .registerOwnerDetails(this.ownerInfoForm.value)
    //     .subscribe((data: RegisterOwner) => {
    //       this.ownerData = data;
    //     });
    //   //this.ownerDS.setOwnerDetails(this.ownerInfoForm.value);
    // }
  }

  searchInTable(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableDataSource.filter = filterValue.trim().toLowerCase();
    if (this.tableDataSource.paginator) {
      this.tableDataSource.paginator.firstPage();
    }
  }

  dateFormatChange(date: String) {
    return date.split('-').reverse().join('-');
  }

  getWords(monthCount: any) {
    return this.treatmentService.getWords(monthCount);
  }

  formatDate(date: string) {
    if (date) {
      return moment(new Date(date)).format('DD/MM/YYYY');
    }
    return null;
  }

  routingNewCase(section, queryParams) {
    let title = '';
    if (this.ownerDetailsByID.registrationStatus != '1') {
      this.dialog.open(TreatmentResponseDialogComponent, {
        data: {
          title: this.translatePipe.transform('common.info_label'),
          message: this.translatePipe.transform(
            'animalTreatmentSurgery.owner_is_not_active_new_transaction_cannot_be_created'
          ),
          primaryBtnText: this.translatePipe.transform('common.ok_string'),
        },
        panelClass: 'common-info-dialog',
        width: '500px',
      });
    } else {
      switch (this.selectedAnimal.animalStatusCd) {
        case 1:
          this.router.navigate([`dashboard/group-disease-testing/${section}`], {
            queryParams: queryParams,
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

      // this.dialog.open(TreatmentResponseDialogComponent, {
      //   data: {
      //     title,
      //     message: 'New transaction cannot be created.',
      //     primaryBtnText: 'OK',
      //   },
      //   width: '500px',
      // });
      this.healthService.handleError({
        title,
        message: this.translatePipe.transform(
          'animalTreatmentSurgery.new_transaction_cannot_be_created'
        ),
        primaryBtnText: this.translatePipe.transform('common.ok_string'),
      });
    }
  }

  seePreviousResults(element) {
    this.router.navigate([
      `dashboard/group-disease-testing/previous-testing-results/${element.animalId}`,
    ]);
  }

  viewAnimalHistory(element) {
    this.healthService.viewAnimalHistory(element, 6);
  }
}
