import {
  Component,
  Input,
  OnChanges,
  OnInit,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { OwnerDetailsService } from 'src/app/features/animal-management/owner-registration/owner-details.service';
import { AnimalHealthConfig } from 'src/app/shared/animal-health.config';
import { MasterConfig } from 'src/app/shared/master.config';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { AnimalTreatmentService } from '../../animal-treatment/animal-treatment.service';
import { AnimalMasterList } from '../../animal-treatment/models/master.model';
import { ViewMoreDialogComponent } from '../../deworming/view-more-dialog/view-more-dialog.component';
import { HealthService } from '../../health.service';
import { Animal } from '../../vaccination/models/animal.model';
import { TagIdSearchValidation } from 'src/app/shared/utility/validation';
import { AnimalRegistrationList } from 'src/app/features/animal-management/owner-registration/models-owner-reg/get-ownerby-ownerID.model';
import { OwnerData } from 'src/app/features/animal-management/owner-registration/models-owner-reg/get-owner-details.model';
import { AnimalData } from '../../disease-testing/new-test/new-test.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { ViewOrganizationComponent } from 'src/app/features/animal-management/animal-registration/view-organization/view-organization.component';
import { EditOwnerDetailsComponent } from 'src/app/features/animal-management/owner-registration/edit-owner-details/edit-owner-details.component';
import { OtpDialogComponent } from 'src/app/shared/otp-dialog/otp-dialog.component';
import { RegisterOwner } from 'src/app/features/animal-management/owner-registration/models-owner-reg/register-owner.model';
import { OwnerType } from 'src/app/shared/common-search-box/common-search-box.component';

@Component({
  selector: 'app-animal-by-village',
  templateUrl: './animal-by-village.component.html',
  styleUrls: ['./animal-by-village.component.css'],
  providers: [TranslatePipe],
})
export class AnimalByVillageComponent implements OnInit, OnChanges {
  ownerTypeCd = OwnerType.individual;
  searchBy: string = 'individual';
  individualOwner: boolean = true;
  masterConfig = MasterConfig;
  @Input() poolAnimalCount: any;
  @Input() isPool: any;
  @Input() firFlag: any;
  isLoadingSpinner: boolean = false;
  searchForm: FormGroup;
  searchTagForm: FormGroup;
  errorMessage: string = '';
  villageMaster = [];
  dataSource = new MatTableDataSource([]);
  tagTableFlag = false;
  groupDataSource = new MatTableDataSource([]);
  groupCheckFlag: boolean = false;
  GroupCheck: FormControl = new FormControl(false);
  TagCheck: FormControl = new FormControl(false);
  isOwnerListTableFlag: boolean = false;
  noOfActiveAnimals: number = 0;
  isTableDetailsVisible: boolean = false;
  ownerDetailsSection: boolean = false;
  animalDetailsSection: boolean = false;
  tableDataSourceOwner = new MatTableDataSource<OwnerData>();
  private searchOwnerPaginator!: MatPaginator;
  private withpaginator!: MatPaginator;
  selectedAnimalId = null;
  selectedAnimal: AnimalData;
  isAnimalTabVisible: boolean = false;
  ownerData!: RegisterOwner;
  ownerInfoForm!: FormGroup;
  clickedOwnerName: string = '';
  clickedOwnerMobNo: number = 0;
  groupAnimalDataSource = new MatTableDataSource([]);
  TagTableDataSource = new MatTableDataSource([]);
  tableForm: FormGroup;
  isAnimalTableVisible = true;
  noAnimalRegistered = false;
  selectedAnimals = [];
  animalDetail: Animal[] = [];
  ownerDetailsByID: any;
  isTableVisible: boolean = false;
  noDataFound: boolean = false;
  animalList: any[] = [];
  isGroupVisible: boolean = false;
  isGroupTableVisible: boolean = false;
  isGroupAnimalTableVisible: boolean = false;
  groupTagCheckFlag: boolean = false;
  selectedGroupID = '';
  animalKeys = animal_Keys;
  displayedColumns = displayed_Columns;
  groupDisplayedColumns = groupDisplayed_Columns;
  displayedgroupAnimalColumns = displayedgroup_AnimalColumns;
  noOfBoxes = 0;
  validationMsg = animalHealthValidations.groupDiseaseTesting;
  ownerDetailsRecord: any[] = [];

  ownerSearchResult: string[] = [
    'sNo',
    'ownerId',
    'ownerName',
    'ownerMobileNo',
    'gender',
    'ownerDateOfBirth',
    'villageName',
  ];
  displayedColumnsNonIndiv: string[] = [
    'radio',
    'sr_no',
    'tagId',
    'category',
    'animalCategoryNonIndividual',
    'breedDesc',
    'sex',
    'ageInMonths',
    'pregnancyStatus',
    'milkingStatus',
    'status',
    'history',
  ];
  animalPageIndex = 0;
  animalPageSize = 5;
  animalsCount = 0;
  constructor(
    private _fb: FormBuilder,
    private _healthService: HealthService,
    public dialog: MatDialog,
    private treatmentService: AnimalTreatmentService,
    private ownerDS: OwnerDetailsService,
    private router: Router,
    private healthService: HealthService,
    private readonly translateService: TranslateService,
    private route: ActivatedRoute,
    private translatePipe: TranslatePipe
  ) { }

  @ViewChild(MatSort) set groupAnimaSort(groupAnimaSort: MatSort) {
    this.groupAnimalDataSource.sort = groupAnimaSort;
  }
  @ViewChild('groupAnimalPaginator') set groupAnimalPaginator(groupAnimalPaginator: MatPaginator) {
    this.groupAnimalDataSource.paginator = groupAnimalPaginator;
  }

  @ViewChild(MatSort) set animalTagSort(animalTagSort: MatSort) {
    this.TagTableDataSource.sort = animalTagSort;
  }
  @ViewChild('animalTagPaginator') set animalTagPaginator(animalTagPaginator: MatPaginator) {
    this.TagTableDataSource.paginator = animalTagPaginator;
  }

  @ViewChild(MatSort) set groupSort(groupSort: MatSort) {
    this.groupDataSource.sort = groupSort;
  }
  @ViewChild('groupPaginator') set groupPaginator(gP: MatPaginator) {
    this.groupDataSource.paginator = gP;
  }

  @ViewChild(MatSort) set sort(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  // @ViewChild('animalPaginator') set paginator(ap: MatPaginator) {
  //   this.dataSource.paginator = ap;
  //   this.withpaginator = ap;
  // }

  @ViewChild('animalPaginator') animalPaginator: MatPaginator;

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
  }

  @ViewChild('SearchOwnerpaginatorRef') set ownerMatPaginator(
    mp: MatPaginator
  ) {
    this.searchOwnerPaginator = mp;
  }

  ngOnInit(): void {
    this.searchForm = this._fb.group({
      searchValue: [null, [Validators.required]],
      searchGrouporTag: [null],
    });
    this.searchTagForm = this._fb.group({
      optRadio: [this.searchBy],
      searchValue: ['', [Validators.required, TagIdSearchValidation]],
      searchGrouporTag: [null],
    });
    this.getVillageByUser();

    this.tableForm = this._fb.group({});

    this.searchForm.get('searchValue').valueChanges.subscribe((param: any) => {
      this.GroupCheck.patchValue(false);
      this.isGroupVisible = false;
    });

    this.GroupCheck.valueChanges.subscribe((value: any) => {
      if (value) {
        this.getGroupBasedOnVillage();
        this.isGroupVisible = true;
        this.GroupCheck.value;
      } else {
        this.isGroupVisible = false;
        this.isGroupAnimalTableVisible = false;
      }
    });
    this.TagCheck.valueChanges.subscribe((value: any) => {
      if (value) {
        this.getGroupByTagId(this.searchTagForm.get('searchGrouporTag').value);
      } else {
        this.isGroupVisible = false;
      }
    });
  }


  getGroupBasedOnVillage() {
    this.isLoadingSpinner = true;
    this.healthService
      .getGroupbyVillage(this.searchForm.get('searchValue')?.value?.villageCd)
      .subscribe(
        (res: any) => {
          res = res ?? [];
          res = res.map((group: any) => {
            return {
              ...group,
              villageDesc: group.villageDetails.map((v) => v.villageName),
            };
          });
          this.groupDataSource.data = res;
          this.isGroupVisible = true;
          this.isLoadingSpinner = false;
        },
        (err) => (this.isLoadingSpinner = false)
      );
  }

  ngOnChanges(changes: SimpleChanges) {
    // if (changes.poolAnimalCount.currentValue) {
    // }
  }

  searchInOwners(event: Event) {
    const filterOwnerValue = (event.target as HTMLInputElement).value;
    this.tableDataSourceOwner.filter = filterOwnerValue.trim().toLowerCase();
    if (this.tableDataSourceOwner.paginator) {
      this.tableDataSourceOwner.paginator.firstPage();
    }
  }

  animalSelected(event: Event, animal: AnimalData) {
    this.selectedAnimalId = +(event.target as HTMLSelectElement).value;
    this.selectedAnimal = animal;
  }
  getAnimalForGroup(group) {
    this.isLoadingSpinner = true;
    this.noOfActiveAnimals = 0;
    this.healthService.getAnimalbyGroup(group.groupId).subscribe(
      (res: any) => {
        res = res?.animalDetails ?? [];
        for (let animal of res) {
          if (animal.ageInMonths) {
            animal.ageInMonths = this.getWords(animal.ageInMonths);
          }
          else if (animal.ageInDays) {
            animal.ageInMonths = `${animal.ageInDays}D`;
          }
          animal['breedAndExoticLevels'] =
            animal.breedAndExoticLevels &&
              animal.breedAndExoticLevels.length > 1
              ? 'Cross Breed'
              : animal.breedAndExoticLevels &&
                animal.breedAndExoticLevels.length
                ? animal.breedAndExoticLevels[0].breed
                : 'NA';
          animal['village'] = animal.ownerDetails.ownerVillageName;
          animal['villageCd'] = animal.ownerDetails.ownerVillageName;
          if (animal['animalStatusCd'] == 1) {
            this.noOfActiveAnimals++;
          }
        }
        this.groupAnimalDataSource.data = res;
        this.isGroupAnimalTableVisible = true;
        this.isTableVisible = false;
        this.selectedGroupID = group.groupId;
        this.isLoadingSpinner = false;
        this.tagTableFlag = false;
      },
      (err) => (this.isLoadingSpinner = false)
    );
  }

  getVillageByUser() {
    this.isLoadingSpinner = true;
    this._healthService.getVillagesbyUserID().subscribe(
      (res: any) => {
        this.villageMaster = res;
        this.isLoadingSpinner = false;
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  get formControls() {
    return this.searchForm.controls;
  }

  get tagFormControls() {
    return this.searchTagForm.controls;
  }


  onSelectingSearchBy(event: Event) {
    this.searchBy = (event.target as HTMLInputElement)?.value;
    this.searchTagForm.get('searchValue').reset();
    this.searchTagForm.get('searchGrouporTag').reset();
    this.isGroupVisible = false;
    this.isTableVisible = false;
    this.tagTableFlag = false;
    this.isOwnerListTableFlag = false;
    this.isGroupAnimalTableVisible = false;
    this.errorMessage = '';
    if (this.searchBy == 'individual') {
      this.individualOwner = true;
    } else {
      this.individualOwner = false;
    }
  }

  searchResults() {
    this.searchForm.get('searchValue').markAsTouched();
    if (this.searchForm.invalid) {
      return;
    }
    this.getAnimalListbyVillage();
  }

  searchGrouporTag(individualFlag = true) {
    const param = individualFlag ? this.searchTagForm.get('searchGrouporTag') : this.searchTagForm.get('searchValue');
    this.searchTagForm.markAsTouched();
    this.noDataFound = false;
    if (
      param?.value == undefined ||
      param?.value == null ||
      param?.value.length == 0
    ) {
      this.errorMessage = this.translatePipe.transform('errorMsg.enter_value');
      return;
    } else {
      this.errorMessage = '';
    }
    this.searchForm.get('searchValue').patchValue(null);
    this.groupCheckFlag = false;
    const inputParam = param.value;
    this.isGroupVisible = false;
    this.TagCheck.patchValue(false);
    this.searchForm.get('searchValue').markAsUntouched();
    if (
      (inputParam.length == 8 ||
        inputParam.length == 11 ||
        inputParam.length == 12) &&
      !isNaN(+inputParam)
    ) {
      this.getAnimalByTagId(inputParam);
    } else if (!isNaN(+inputParam) && inputParam.length != 10 && inputParam.length != 15) {
      this.noOfActiveAnimals = 0;
      this.getAnimalForGroup({ groupId: inputParam });
    } else {
      this.getOwnerData(inputParam, !individualFlag);
    }
  }

  getOwnerData(param: string, individual) {
    this.errorMessage = '';
    this.tagTableFlag = false;
    this.TagTableDataSource.data = [];
    this.ownerDS.getOwnerByMobile(param.trim(), individual).subscribe(
      (data) => {
        this.ownerDetailsRecord = data;
        if (this.ownerDetailsRecord.length > 1) {
          this.isOwnerListTableFlag = true;
          this.isTableVisible = false;
        } else if (this.ownerDetailsRecord.length == 1) {
          this.showOwnerDetails(this.ownerDetailsRecord[0].ownerId);
        } else {
          this.checkSearchValidity();
        }
      },
      (err) => { }
    );
  }
  onPageAnimalPageChange(event: PageEvent) {
    this.animalPageIndex = event.pageIndex;
    this.animalPageSize = event.pageSize;
    this.showOwnerDetails(this.ownerDetailsByID?.ownerId);
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
          this.isOwnerListTableFlag = false;
          this.isTableVisible = true;
          // this.dataSource.data = res?.animalsList
          //   ? res?.animalsList?.map((animal) => ({ ...res, ...animal }))
          //   : [];
          for (let animal of this.ownerDetailsByID.animalsList) {
            if (animal.ageInMonths) {
              animal.ageInMonths = this.getWords(animal.ageInMonths);
            }
            else if (animal.ageInDays) {
              animal.ageInMonths = `${animal.ageInDays}D`;
            }
            animal['breedDesc'] =
              animal.breedAndExoticLevels &&
                animal.breedAndExoticLevels.length > 1
                ? 'Cross Breed'
                : animal.breedAndExoticLevels &&
                  animal.breedAndExoticLevels.length
                  ? animal.breedAndExoticLevels[0].breed
                  : 'NA';
            animal['village'] = this.ownerDetailsByID.ownerVillageName;
            animal['villageCd'] = this.ownerDetailsByID.ownerAddressCityVillageCd ?? null;
            if (animal['animalStatusCd'] == 1) {
              this.noOfActiveAnimals++;
            }
          }
          this.dataSource.data = this.ownerDetailsByID.animalsList;
          this.isLoadingSpinner = false;
          this.animalsCount = res.animalsCount;
        },
        () => (this.isLoadingSpinner = false)
      );
  }

  // getOwnerDetailsByID(ownerId) {
  //   this.noOfActiveAnimals = 0;
  //   this.ownerDS.getOwnerByOwnerID(ownerId).subscribe(
  //     (data) => {
  //       this.ownerDetailsByID = data;
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
  //           animal['village'] = this.ownerDetailsByID.ownerVillageName;
  //           animal['villageCd'] = this.ownerDetailsByID.ownerAddressCityVillageCd ?? null;
  //           if (animal['animalStatusCd'] == 1) {
  //             this.noOfActiveAnimals++;
  //           }
  //         }
  //         this.dataSource.data = this.ownerDetailsByID.animalsList;
  //         this.isOwnerListTableFlag = false;
  //         this.isTableVisible = true;
  //         this.showHideTableFunc('villageanimals');
  //       }
  //     },
  //     (err) => { }
  //   );
  // }

  checkSearchValidity() {
    this.healthService.handleError({
      title: this.translateService.instant('common.info_label'),
      message: this.translateService.instant(
        'animalTreatmentSurgery.no_data_found_please_register_the_owner'
      ),
      primaryBtnText: this.translateService.instant('common.ok_string'),
    });
  }

  getAnimalByTagId(inputParam: number) {
    this.isLoadingSpinner = true;
    if (!this.TagTableDataSource.data.length) {
      this.animalDetail.length = 0;
    }
    this.healthService.getDetailsByTagID(inputParam.toString()).subscribe(
      (searchResult: any) => {
        this.isLoadingSpinner = false;
        this.ownerDetailsByID = searchResult.ownerDetails;
        var animalList: any = <AnimalMasterList>{};
        for (let key of this.animalKeys) {
          animalList[key] = searchResult[key];
        }
        if (searchResult?.animalId) {
          if (
            searchResult.isLoanOnAnimal &&
            !searchResult?.animalStatus?.includes('Sold')
          ) {
          }
        }
        if (searchResult.ownerDetails.ownerId) {
          this.searchTagForm.patchValue({
            optRadio: String(searchResult.ownerDetails.ownerId).startsWith('1')
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
        //animalList.ageInMonths = this.getWords(animalList.ageInMonths);
        if (animalList.ageInMonths) {
          animalList.ageInMonths = this.getWords(animalList.ageInMonths);
        }
        else if (animalList.ageInDays) {
          animalList.ageInMonths = `${animalList.ageInDays}D`;
        }
        animalList['breedDesc'] =
          animalList.breedAndExoticLevels &&
            animalList.breedAndExoticLevels.length > 1
            ? 'Cross Breed'
            : animalList.breedAndExoticLevels &&
              animalList.breedAndExoticLevels.length
              ? animalList.breedAndExoticLevels[0].breed
              : 'NA';
        //this.TagTableDataSource = new MatTableDataSource([animalList]);
        if (!this.TagTableDataSource.data.length) this.noOfActiveAnimals = 0;
        const isAnimalExist = this.TagTableDataSource.data
          .map((animal) => animal.animalId)
          .includes(animalList.animalId);
        if (!isAnimalExist) {
          this.TagTableDataSource.data = [
            ...this.TagTableDataSource.data,
            animalList,
          ];
          if (animalList['animalStatusCd'] == 1) {
            this.noOfActiveAnimals++;
          }
        }
        this.tagTableFlag = true;
        this.groupTagCheckFlag = true;
        this.isOwnerListTableFlag = false;
        this.isTableVisible = false;
        this.isGroupAnimalTableVisible = false;
        this.dataSource.data = [];
        this.ownerDetailsSection = true;
        this.animalDetailsSection = true;
        this.isAnimalTabVisible = true;
        //this.searchForm.get('searchGrouporTag').patchValue(null);
        if (searchResult.ownerDetails.ownerId) {
          this.ownerTypeCd = searchResult?.ownerDetails.ownerTypeCd;
          this.ownerDetailsSection = true;
          this.isAnimalTabVisible = true;
        } else {
          this.ownerTypeCd = OwnerType.organization;
          this.ownerDetailsSection = true;

          this.isAnimalTabVisible = true;
        }
      },
      (error) => {
        this.isLoadingSpinner = false;
        this.isOwnerListTableFlag = false;
        this.isTableVisible = false;
        this.groupTagCheckFlag = false;
        this.tagTableFlag = false;
        this.ownerDetailsSection = false;
        this.animalDetailsSection = false;
        this.isAnimalTabVisible = false;
      }
    );
  }

  getGroupByTagId(inputParam: any) {
    this.healthService.getGroupByTagID(inputParam).subscribe((res: any) => {
      res = res?.map((group: any) => {
        return {
          ...group,
          villageDesc: group.villageDetails.map((v) => v.villageName),
        };
      });
      this.groupDataSource.data = res ?? [];
      this.isGroupVisible = true;
      this.isLoadingSpinner = false;
    });
  }

  getAnimalListbyVillage() {
    const request = {
      inputMapping: [
        {
          key: '2',
          value: this.searchForm.get('searchValue')?.value?.villageCd,
        },
      ],
      responseType: '3',
    };
    this.isLoadingSpinner = true;
    this.searchTagForm.get('searchGrouporTag').patchValue(null);
    this.noOfActiveAnimals = 0;
    this._healthService.getAnimalbyVillage(request).subscribe(
      // this.ownerDS.getOwnerByOwnerID(ownerId).subscribe(
      (data: any) => {
        this.animalList = data.animalDetails;
        this.isLoadingSpinner = false;
        if (this.animalList && this.animalList.length) {
          for (let animal of this.animalList) {
            if (animal.ageInMonths) {
              animal.ageInMonths = this.getWords(animal.ageInMonths);
            }
            else if (animal.ageInDays) {
              animal.ageInMonths = `${animal.ageInDays}D`;
            }
            animal['breedAndExoticLevels'] =
              animal.breedAndExoticLevels &&
                animal.breedAndExoticLevels.length > 1
                ? 'Cross Breed'
                : animal.breedAndExoticLevels &&
                  animal.breedAndExoticLevels.length
                  ? animal.breedAndExoticLevels[0].breed
                  : 'NA';
            animal['village'] = this.searchForm.value.searchValue.villageName;
            animal['villageCd'] = this.searchForm.value.searchValue.villageCd;
            if (animal['animalStatusCd'] == 1) {
              this.noOfActiveAnimals++;
            }
          }
          this.dataSource.data = this.animalList;
          this.isOwnerListTableFlag = false;
          this.isTableVisible = true;
          this.groupCheckFlag = true;
          this.noDataFound = false;
        } else {
          this.isOwnerListTableFlag = false;
          this.isTableVisible = false;
          this.noDataFound = true;
        }
        this.tagTableFlag = false;
        this.isLoadingSpinner = false;
        this.searchForm.get('searchGrouporTag').patchValue(null);
        this.groupTagCheckFlag = false;
        this.TagTableDataSource.data = [];
        this.animalDetail.length = 0;
      },
      () => {
        this.isLoadingSpinner = false;
        this.dataSource.data = [];
        this.isOwnerListTableFlag = false;
        this.isTableVisible = false;
        this.noDataFound = false;
        this.isLoadingSpinner = false;
      }
    );
  }

  getWords(monthCount: any) {
    return monthCount ? this.treatmentService.getWords(monthCount) : null;
  }

  searchInTable(event: Event, flag) {
    const filterValue = (event.target as HTMLInputElement).value;
    switch (flag) {
      case 'village':
        this.dataSource.filter = filterValue.trim().toLowerCase();
        break;
      case 'group':
        this.groupAnimalDataSource.filter = filterValue
          .trim()
          .toLocaleLowerCase();
        break;
      case 'tag':
        this.TagTableDataSource.filter = filterValue.trim().toLocaleLowerCase();
    }
  }

  checkAllBoxes(event, flag) {
    this.animalDetail.length = 0;
    if (this.isPool && !this.poolAnimalCount) {
      this.healthService.handleError({
        title: this.translatePipe.transform('common.info_label'),
        message: `Please select no. of pool animals.`,
        primaryBtnText: this.translatePipe.transform('common.ok_string'),
      });
      event.target.checked = false;
      return;
    }
    if (event.target.checked) {
      const tableData =
        flag == 'village' ? this.dataSource.data : this.TagTableDataSource.data;
      for (var i = 0; i < tableData.length; i++) {
        if (
          (!this.poolAnimalCount ||
            this.poolAnimalCount > this.animalDetail.length) &&
          tableData[i].animalStatusCd == 1
        )
          this.animalDetail.push(tableData[i]);
        else continue;
      }
      if (this.poolAnimalCount != this.animalDetail.length) {
        event.target.checked = false;
      }
    }
  }

  onCheckboxChange(event, element: Animal) {
    if (this.isPool && !this.poolAnimalCount) {
      this.healthService.handleError({
        title: this.translatePipe.transform('common.info_label'),
        message: this.translatePipe.transform(
          'errorMsg.please_select_no_of_pool_animals'
        ),
        primaryBtnText: this.translatePipe.transform('common.ok_string'),
      });
      event.target.checked = false;
      return;
    }
    if (event.target.checked) {
      if (
        !this.poolAnimalCount ||
        this.poolAnimalCount > this.animalDetail.length
      )
        this.animalDetail.push(element);
      else {
        event.target.checked = false;
        return;
      }
    } else {
      this.animalDetail.forEach((value, index) => {
        if (value.tagId === element.tagId) this.animalDetail.splice(index, 1);
      });
    }
    this.noOfBoxes = this.animalDetail.length;
  }

  checkIfInSelectedList(element: Animal) {
    // return this.animalDetail.includes(element);
    return !!this.animalDetail.find((obj) => {
      return obj.tagId === element.tagId;
    });
  }

  onClickingRemove(element: Animal) {
    this.animalDetail.forEach((value, index) => {
      if (value.tagId === element.tagId) this.animalDetail.splice(index, 1);
    });
  }

  clearVillageName() {
    this.errorMessage = '';
    this.noDataFound = false;
    this.isGroupVisible = false;
    this.isGroupAnimalTableVisible = false;
    this.groupTagCheckFlag = false;
    this.groupCheckFlag = false;
  }

  getAnimalHealthHistory(element) { }
  resetValue() {
    this.searchForm.reset();
    this.searchTagForm.reset();
    this.isOwnerListTableFlag = false;
    this.isTableVisible = false;
    // this.showDraft = true;
    this.errorMessage = '';
    this.isGroupVisible = false;
    this.isGroupAnimalTableVisible = false;
    //this.tagTableFlag = false;
    this.groupTagCheckFlag = false;
    this.groupCheckFlag = false;
    this.dataSource.paginator = null;
    this.animalPageIndex = 0;
    this.animalPageSize = 5;
    this.animalsCount = 0;
    //this.router.navigate(['.'], { relativeTo: this.route });
  }
  seePreviousResults(element) {
    this.router.navigate([
      `dashboard/group-disease-testing/previous-testing-results/${element.animalId}`,
    ]);
  }

  showHideTableFunc(flag) {
    switch (flag) {
      case 'villageanimals':
        break;
      case 'ownerlist':
        break;
      case 'groupanimals':
        break;
      case 'taganimals':
        break;
    }
  }

  viewAnimalHistory(element) {
    this.healthService.viewAnimalHistory(element, 6);
  }

  dateFormatChange(date: String) {
    date = date.substring(0, 10);
    return date.split('-').reverse().join('/');
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
        this.showOwnerDetails(this.ownerDetailsByID?.ownerId);
        this.ownerDS.seteditDetailsFlag(false);
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

  get ownerType() {
    return OwnerType;
  }
}

const animal_Keys: string[] = [
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
  'pregnancyStatus',
  'milkingStatus',
  'ownerDetails',
  'animalCategory'
];

const displayed_Columns = [
  'checkbox',
  'sr_no',
  'tagId',
  'species',
  'animalCategory',
  'breedAndExoticLevels',
  'sex',
  'ageInMonths',
  'pregnancyStatus',
  'village',
  'dateOfBirth',
  'animalStatus',
  'previousResults',
  'health_history',
];

const groupDisplayed_Columns = [
  'groupId',
  'testingDate',
  'villageDesc',
  'noOfAnimals',
  'diseaseDesc',
];

const displayedgroup_AnimalColumns = [
  'sr_no',
  'tagId',
  'species',
  'breedAndExoticLevels',
  'sex',
  'ageInMonths',
  'pregnancyStatus',
  'village',
  'dateOfBirth',
  'animalStatus',
  'previousResults',
  'health_history',
];

