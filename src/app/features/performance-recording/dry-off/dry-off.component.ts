import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { animalBreedingPRConfig } from 'src/app/shared/animal-breeding-pr.config';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { MasterConfig } from 'src/app/shared/master.config';
import { OtpDialogComponent } from 'src/app/shared/otp-dialog/otp-dialog.component';
import { AppService } from 'src/app/shared/shareService/app.service';
import { DataServiceService } from 'src/app/shared/shareService/data-service.service';
import { TehsilList } from 'src/app/shared/shareService/model/tehsil.model';
import { VillageList } from 'src/app/shared/shareService/model/village.model';
import { SnackBarMessage } from 'src/app/shared/snack-bar';
import { MembershipNumberValidation } from 'src/app/shared/utility/validation';
import { ModifyAnimalDetailsComponent } from '../../animal-breeding/modify-animal-details/modify-animal-details.component';
import { SuccessDialogComponent } from '../../animal-breeding/success-dialog/success-dialog.component';
import { HealthService } from '../../animal-health/health.service';
import { ViewOrganizationComponent } from '../../animal-management/animal-registration/view-organization/view-organization.component';
import { AddDetailsDialogComponent } from '../../animal-management/owner-registration/add-details-dialog/add-details-dialog.component';
import { EditOwnerDetailsComponent } from '../../animal-management/owner-registration/edit-owner-details/edit-owner-details.component';
import { CommonData } from '../../animal-management/owner-registration/models-owner-reg/common-data.model';
import { RegisterOwner } from '../../animal-management/owner-registration/models-owner-reg/register-owner.model';
import { InstitutionName } from '../../animal-management/owner-registration/models-owner-reg/village-institution-name';
import { PrService } from '../pr.service';
import { DryOffDetailsFormDialogComponent } from './dry-off-details-form-dialog/dry-off-details-form-dialog.component';
import { DryOffService } from './dry-off.service';
import { MatSort } from '@angular/material/sort';
import {
  OwnerType,
  SearchValue,
} from 'src/app/shared/common-search-box/common-search-box.component';
import { SearchResponse } from '../growth-monitoring/models/search-response.model';

@Component({
  selector: 'app-dry-off',
  templateUrl: './dry-off.component.html',
  styleUrls: ['./dry-off.component.css'],
  providers: [TranslatePipe],
})
export class DryOffComponent implements OnInit {
  orgId: number = null;
  ownerTypeCd = OwnerType.individual;
  masterConfig = MasterConfig;
  isTableVisible: boolean = false;
  tehsilList: TehsilList[] = [];
  villageList: VillageList[] = [];
  langData: string = '';
  isAnimalTabVisible: boolean = false;
  ownerInfoForm!: FormGroup;
  ownerDetailsSection: boolean = false;
  animalDetailsSection: boolean = false;
  additionalDetailsCounter: number = 0;
  errorMessage: string = '';
  cities: string[] = [];
  ownerDataSource = new MatTableDataSource<any>([]);
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
  ownerId?: number;
  noOfActiveAnimals = 0;
  selectedAnimals: any[] = [];
  minDate = '';
  totalRows = 0;
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions: number[] = [5, 10, 25, 50];
  displayedColumns: string[] = [
    'radio',
    '#',
    'tagId',
    'species',
    'animalCategory',
    'breedDesc',
    'ageInMonths',
    'milkingStatus',
    'currentLactationNo',
    'dryOffDate',
    'elite',
    'action',
  ];
  animalKeys: string[] = [
    'taggingDate',
    'tagId',
    'ageInDays',
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
    'pregnancyStatus',
    'milkingStatus',
    'dryOffDate',
    'animalCategory',
  ];
  tableDataSource = new MatTableDataSource<any>();
  userProjects = [];
  searchValue: SearchValue;
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

  @ViewChild('paginatorRef') set ownerPaginator(mp: MatPaginator) {
    this.ownerDataSource.paginator = mp;
  }

  @ViewChild(MatPaginator,{static:false})
  paginator!: MatPaginator;


  @ViewChild(MatSort) set sort(sort: MatSort) {
    this.tableDataSource.sort = sort;
    this.ownerDataSource.sort = sort;
  }

  constructor(
    public dialog: MatDialog,
    private translatePipe: TranslatePipe,
    private router: Router,
    private route: ActivatedRoute,
    private healthService: HealthService,
    private prService: PrService,
    private dryOffService: DryOffService,
    private _snackbar: MatSnackBar,
    private appService: AppService,
    private dataService: DataServiceService
  ) {}

  ngOnInit(): void {
    this.userProjects = JSON.parse(sessionStorage.getItem('user')).userProject;
    this.isLoadingSpinner = true;
    this.dataService
      .getDefaultConfig(animalBreedingPRConfig.backdate.DryoffBackdate)
      .subscribe((config) => {
        this.isLoadingSpinner = false;

        this.minDate = moment(this.prService.currentDate)
          .subtract(config.defaultValue, 'days')
          .format('YYYY-MM-DD');
      });
  }

  searchResults(searchValue: SearchValue,isPaginator?:boolean) {
    this.resetValue(false);
    this.searchValue = searchValue;

    // sample id search

    this.isLoadingSpinner = true;
    this.errorMessage = '';
    this.searchValue.pageNo = isPaginator ? this.currentPage : 0
    this.searchValue.itemPerPage = this.pageSize
    this.prService.getSearchDetails(searchValue).subscribe(
      (data) => {
        this.ownerDataSource.data = data;

        if (this.ownerDataSource.data.length === 1) {
          this.showOwnerDetails(this.ownerDataSource.data[0]);
          this.changePaginatorIndex(isPaginator) 
        } else if (this.ownerDataSource.data.length > 1) {
          this.isTableVisible = true;
        }
        this.isLoadingSpinner = false;
      },
      (err) => (this.isLoadingSpinner = false)
    );
  }

  showOwnerDetails(owner: SearchResponse | any) {
    this.ownerDetailsByID = owner;
    this.isTableVisible = false;
    this.ownerDetailsSection = true;
    this.animalDetailsSection = true;
    this.ownerTypeCd = owner.ownerTypeCd ?? OwnerType.organization;
    if (this.ownerTypeCd === OwnerType.organization) {
      this.orgId = owner.orgId;
    }
    this.totalRows = this.ownerDetailsByID.animalsCount 
    if (this.ownerDetailsByID?.animalsList?.length) {
      this.tableDataSource.data = this.ownerDetailsByID?.animalsList.map(
        (animal) => ({
          ...animal,
          breedDesc: this.getAnimalBreed(animal),
        })
      );
    }
  }

  getAnimalBreed(animal: SearchResponse['animalsList'][0]) {
    return animal.breedAndExoticLevels && animal.breedAndExoticLevels.length > 1
      ? 'Cross Breed'
      : animal.breedAndExoticLevels && animal.breedAndExoticLevels.length
      ? animal.breedAndExoticLevels[0].breed
      : '--';
  }

  routingFollowup(section, route) {
    this.router.navigate([
      `dashboard/animal-treatment-surgery/${section}`,
      route,
    ]);
  }

  onProjectChange(projectId: string) {
    this.isLoadingSpinner = true;
    this.dryOffService.getAnimalsEligibleForDryOff(projectId).subscribe(
      (res: any[]) => {
        this.isLoadingSpinner = false;
        this.isTableVisible = false;
        this.ownerDetailsSection = false;
        this.animalDetailsSection = true;
        if (res && res.length) {
          this.isAnimalTabVisible = true;
          this.tableDataSource.data = res.map((animal) => {
            animal['breedDesc'] =
              animal.breedAndExoticLevels &&
              animal.breedAndExoticLevels.length > 1
                ? 'Cross Breed'
                : animal.breedAndExoticLevels &&
                  animal.breedAndExoticLevels.length
                ? animal.breedAndExoticLevels[0].breed
                : '--';
            return animal;
          });
        } else {
          this.isAnimalTabVisible = false;
          this.tableDataSource.data = [];
        }
      },
      () => {
        this.isLoadingSpinner = false;
        this.animalDetailsSection = false;
        this.isTableVisible = false;
        this.ownerDetailsSection = false;
        this.isAnimalTabVisible = false;
        this.tableDataSource.data = [];
      }
    );
  }

  checkSearchValidity() {
    this.healthService.handleError({
      title: this.translatePipe.transform('common.info_label'),
      message: this.translatePipe.transform(
        'animalTreatmentSurgery.no_data_found_please_register_the_owner'
      ),
      primaryBtnText: this.translatePipe.transform('common.ok_string'),
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
    // dialogRef.afterClosed().subscribe((res) => {
    //   if (this.ownerDS.geteditDetailsFlag()) {
    //     this.getOwnerDetailsByID(this.ownerDetailsByID?.ownerId);
    //     this.ownerDS.seteditDetailsFlag(false);
    //   }
    // });
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
      // if (this.ownerDS.getAddDetailsFlag()) {
      //   this.getOwnerDetailsByID(this.ownerDetailsByID?.ownerId);
      //   this.ownerDS.setAddDetailsFlag(false);
      // }
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
            ? 'Owner Registered Successfully'
            : 'Owner Verification',
        message: "To activate the account, please verify owner's mobile number",
        link: '/dashboard/performance-recording/dry-off',
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
      // if (this.ownerDS.getOwnerRegFlag()) {
      //   this.getOwnerDetailsByID(
      //     actionPerformed == 'registration'
      //       ? this.ownerData?.ownerId
      //       : this.ownerDetailsByID?.ownerId
      //   );
      //   this.ownerDS.setOwnerRegFlag(false);
      // }
    });
    dialogRef.afterClosed().subscribe((res) => {
      // if (this.ownerDS.getOwnerRegFlag()) {
      //   this.getOwnerDetailsByID(
      //     actionPerformed == 'registration'
      //       ? this.ownerData?.ownerId
      //       : this.ownerDetailsByID?.ownerId
      //   );
      //   this.ownerDS.setOwnerRegFlag(false);
      // }
    });
  }

  get ownerInfo() {
    return this.ownerInfoForm.controls;
  }

  get affiliatedAgencyDetails() {
    return (this.ownerInfoForm.controls.affiliatedAgency as FormGroup).controls;
  }

  getToday(): string {
    return this.prService.currentDate.toDate().toISOString().split('T')[0];
  }

  getPastDate(): string {
    var tempDate = this.prService.currentDate.toDate();
    tempDate.setFullYear(tempDate.getFullYear() - 150);
    this.currentDate = tempDate.toISOString().split('T')[0];
    return this.currentDate;
  }

  resetValue(resetAll = true) {
    this.ownerRegistrationFlag = false;
    this.ownerDetailsSection = false;
    this.animalDetailsSection = false;
    this.isAnimalTabVisible = false;
    this.isTableVisible = false;
    this.errorMessage = '';
    this.orgId = null;
    if (resetAll) {
      this.router.navigate(['.'], { relativeTo: this.route });
    }
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
    return monthCount ? this.healthService.getWords(monthCount) : null;
  }

  formatDate(date: string) {
    if (date) {
      return moment(new Date(date)).format('DD/MM/YYYY');
    }
    return null;
  }

  getParsedDate(date: string) {
    return moment(date).format('LT') + ' ' + moment(date).format('DD/MM/YYYY');
  }

  isAnimalDisabled(element: any) {
    return element.animalStatusCd !== 1 || element.milkingStatus !== 'In Milk';
  }

  animalSelected(event: Event, animal: any) {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked && this.isAnimalDisabled(animal)) {
      if (animal.animalStatusCd !== 1) {
        new SnackBarMessage(this._snackbar).onSucessMessage(
          this.translatePipe.transform('errorMsg.animal_not_active'),
          this.translatePipe.transform('common.ok_string'),
          'center',
          'top',
          'red-snackbar'
        );
        (event.target as HTMLInputElement).checked = false;
        return;
      } else if (animal.milkingStatus !== 'In Milk') {
        new SnackBarMessage(this._snackbar).onSucessMessage(
          this.translatePipe.transform('errorMsg.animal_is_not_in_milk'),
          this.translatePipe.transform('common.ok_string'),
          'center',
          'top',
          'red-snackbar'
        );
      }
      // (event.target as HTMLInputElement).checked = false;
      // return;
    }

    if (checked) {
      this.selectedAnimals.push(animal);
    } else {
      const index = this.selectedAnimals.findIndex(
        (a) => a.animalId === animal.animalId
      );

      this.selectedAnimals.splice(index, 1);
    }
  }

  onSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      this.selectedAnimals = this.tableDataSource.filteredData.filter(
        (animal) => !this.isAnimalDisabled(animal)
      );
      new SnackBarMessage(this._snackbar).onSucessMessage(
        this.translatePipe.transform(
          'performanceRecording.only_active_and_in_milk_animals_are_selected'
        ),
        this.translatePipe.transform('common.ok_string'),
        'center',
        'top',
        'green-snackbar'
      );
      if (this.selectedAnimals.length === 0) {
        (event.target as HTMLInputElement).checked = false;
      }
    } else {
      this.selectedAnimals.length = 0;
    }
  }

  isAnimalSelected(animal: any) {
    return !!this.selectedAnimals.find((a) => a.animalId === animal.animalId);
  }

  isAllSelected() {
    const tableData = this.tableDataSource.filteredData.filter(
      (animal) => !this.isAnimalDisabled(animal)
    ).length;
    return tableData && tableData === this.selectedAnimals.length;
  }

  onDryOff() {
    this.dialog
      .open(DryOffDetailsFormDialogComponent, {
        data: this.minDate,
        panelClass: 'dry-off-dialog',
        disableClose: true,
      })
      .afterClosed()
      .pipe(
        filter((res) => {
          const selectedDate = moment(res.dryOffDate);

          const taggingDate = moment(this.selectedAnimals[0]?.taggingDate);

          if (selectedDate.isBefore(taggingDate)) {
            this.dialog.open(ConfirmationDialogComponent, {
              data: {
                title: this.translatePipe.transform('common.info_label'),
                message: this.translatePipe.transform(
                  'performanceRecording.please_select_date_after_animal_tagging_date'
                ),
                primaryBtnText:
                  this.translatePipe.transform('common.ok_string'),
                icon: 'assets/images/alert.svg',
              },
              panelClass: 'common-info-dialog',
            });
            return false;
          }

          return !!res;
        }),
        switchMap((res: { dryOffDate: string; dryOffRecordDate: string }) => {
          const req = this.selectedAnimals.map((animal) => ({
            ...animal,
            ...res,
            lactationNo: animal.currentLactationNo,
            projectId: '1234',

            createdBy: '1234',
            modifiedBy: '1234',
            dryOffId: '1234',
          }));

          this.isLoadingSpinner = true;
          return this.dryOffService.saveDryOff(req);
        })
      )
      .subscribe(
        (res) => this.handleSave(res),
        () => (this.isLoadingSpinner = false)
      );
  }

  openDialog(
    title: string,
    message: string,
    icon: string = 'assets/images/info.svg'
  ): Observable<boolean> {
    return this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          title,
          message,
          primaryBtnText: this.translatePipe.transform('common.yes'),
          secondaryBtnText: this.translatePipe.transform('common.no'),
          icon,
        },
        panelClass: 'common-info-dialog',
      })
      .afterClosed();
  }

  onMassDryOff() {
    this.openDialog(
      this.translatePipe.transform('performanceRecording.are_you_sure'),
      this.translatePipe.transform(
        `performanceRecording.are_you_sure_you_want_to_set_the_milking_status_of_the_selected_tag_ids_to_dry_off_dry_off_date_will_be_set_to_last_date_of_the_last_mr_month`
      )
    )
      .pipe(
        filter((res) => !!res),
        switchMap((res) => {
          const req = this.selectedAnimals.map((animal) => ({
            ...animal,
            lactationNo: animal.currentLactationNo,
            dryOffRecordDate: this.prService.currentDate.toDate(),
            projectId: '1234',
            createdBy: '1234',
            modifiedBy: '1234',
          }));

          this.isLoadingSpinner = true;
          return this.dryOffService.saveDryOff(req);
        })
      )
      .subscribe(
        (res) => this.handleSave(res),
        () => (this.isLoadingSpinner = false)
      );
  }

  handleSave(res: any) {
    this.isLoadingSpinner = false;
    this.dialog.open(SuccessDialogComponent, {
      data: {
        transaction_id:
          res?.data.length === 1
            ? `${res?.data[0]?.dryOffId}`
            : res.data.map((d) => d.dryOffId).join(', '),
        title: this.translatePipe.transform(
          'performanceRecording.dry_off_saved_successfully'
        ),
        primaryBtnText: this.translatePipe.transform('common.ok'),
        icon: 'assets/images/info.svg',
      },
      width: '350px',
      panelClass: 'common-info-dialog',
    });
    this.searchResults(this.searchValue);
    this.selectedAnimals.length = 0;
  }

  onEdit(animal: any) {
    this.dialog
      .open(DryOffDetailsFormDialogComponent, {
        data: this.minDate,
        panelClass: 'dry-off-dialog',
        disableClose: true,
      })
      .afterClosed()
      .pipe(
        filter((res) => {
          const selectedDate = moment(res.dryOffDate);

          const taggingDate = moment(animal.taggingDate);

          if (selectedDate.isBefore(taggingDate)) {
            this.dialog.open(ConfirmationDialogComponent, {
              data: {
                title: this.translatePipe.transform('common.info_label'),
                message: this.translatePipe.transform(
                  'performanceRecording.please_select_date_after_animal_tagging_date'
                ),
                primaryBtnText:
                  this.translatePipe.transform('common.ok_string'),
                icon: 'assets/images/alert.svg',
              },
              panelClass: 'common-info-dialog',
            });
            return false;
          }

          return !!res;
        }),
        switchMap((res) => {
          this.isLoadingSpinner = true;
          return this.dryOffService.editDryOff({
            ...animal,
            lactationNo: animal.currentLactationNo,
            ...res,
          });
        })
      )
      .subscribe(
        () => {
          this.isLoadingSpinner = false;
          this.dialog.open(SuccessDialogComponent, {
            data: {
              title: this.translatePipe.transform(
                'performanceRecording.dry_off_updated_successfully'
              ),
              primaryBtnText: this.translatePipe.transform('common.ok_string'),
              icon: 'assets/images/info.svg',
            },
            width: '350px',
            panelClass: 'common-info-dialog',
          });
          this.searchResults(this.searchValue);
        },
        () => (this.isLoadingSpinner = false)
      );
  }

  onDelete(animal: any) {
    this.openDialog(
      this.translatePipe.transform('performanceRecording.are_you_sure'),

      this.translatePipe.transform(
        'performanceRecording.are_you_sure_you_want_to_reset_the_transaction_and_set_status_of_the_animal_to_in_milk'
      )
    )
      .pipe(
        filter((res) => !!res),
        switchMap((res) => {
          this.isLoadingSpinner = true;
          return this.dryOffService.deleteDryOffDetails({
            ...animal,
            lactationNo: animal.currentLactationNo,
          });
        })
      )
      .subscribe(
        () => {
          this.isLoadingSpinner = false;
          // this.openDialog(
          //   this.translatePipe.transform('common.info_label'),
          //   this.translatePipe.transform(
          //     'performanceRecording.dry_off_details_updated_successfully'
          //   )
          // );
          this.dialog.open(SuccessDialogComponent, {
            data: {
              title: this.translatePipe.transform(
                'performanceRecording.dry_off_delete_successfully'
              ),
              primaryBtnText: this.translatePipe.transform('common.ok_string'),
              icon: 'assets/images/info.svg',
            },
            width: '350px',
            panelClass: 'common-info-dialog',
          });
          this.searchResults(this.searchValue);
        },
        () => (this.isLoadingSpinner = false)
      );
  }

  isAnimalDriedOff(animal: any) {
    return !!(animal.dryOffDate && animal.milkingStatus === 'Dry');
  }

  addAnimalAdditionalDetails(isView?: boolean) {
    if (this.selectedAnimals[0]) {
      const dialogRef = this.dialog.open(ModifyAnimalDetailsComponent, {
        data: {
          animalData: this.selectedAnimals[0],
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
        this.selectedAnimals.length = 0;
        if (res) this.searchResults(this.searchValue);
      });
    } else {
      new SnackBarMessage(this._snackbar).onSucessMessage(
        this.translatePipe.transform('errorMsg.select_tag_first'),
        this.translatePipe.transform('common.ok_string'),
        'center',
        'top',
        'red-snackbar'
      );
    }
  }

  isDryOffDisabled() {
    if (this.selectedAnimals.length === 0) {
      return true;
    }

    return !!this.selectedAnimals.find((animal) =>
      this.isAnimalDisabled(animal)
    );
  }

  isModifyDetailsDisabled() {
    if (this.selectedAnimals.length !== 1) {
      return true;
    }

    if (this.selectedAnimals[0].animalStatusCd !== 1) {
      return true;
    }

    if (
      typeof this.selectedAnimals[0].milkingStatus === 'undefined' ||
      this.selectedAnimals[0].milkingStatus === null ||
      typeof this.selectedAnimals[0].currentLactationNo === 'undefined' ||
      this.selectedAnimals[0].currentLactationNo === null
    ) {
      return false;
    }

    return true;
  }

  checkPermission() {
    return (
      this.appService.isPermission(this.masterConfig.isDelete) &&
      this.appService.isPermission(this.masterConfig.isModify)
    );
  }

  backToOwnerListing(): void {
    this.isTableVisible = true;
    this.animalDetailsSection = false;
    this.ownerDetailsSection = false;
  }
  ngAfterViewInit() {
    this.tableDataSource.paginator = this.paginator;
  }
  pageChanged(event: PageEvent) {
    console.log({ event });
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
      this.searchResults(this.searchValue,true);
  }
  private changePaginatorIndex(isPaginator){
    if(!isPaginator)
          setTimeout(() => {
            this.paginator.pageIndex = 0;
           }, 0);
  }
}
