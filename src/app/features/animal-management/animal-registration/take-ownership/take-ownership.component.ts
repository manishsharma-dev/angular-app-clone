import { OtpDialogComponent } from 'src/app/shared/otp-dialog/otp-dialog.component';
import { ConfirmationDialogComponent } from './../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AddDetailsDialogComponent } from './../../owner-registration/add-details-dialog/add-details-dialog.component';
import { AnimalTable } from '../models-animal-reg/animal-table.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EarTagDialogComponent } from '../../animal-registration/ear-tag-dialog/ear-tag-dialog.component';
import { EarTagChangeService } from '../../animal-registration/ear-tag-change/ear-tag-change.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationEnd, Router } from '@angular/router';
import { TagIdSearchValidation } from '../../../../shared/utility/validation';
import { SnackBarMessage } from '../../../../shared/snack-bar';
import { EditOwnerDetailsComponent } from '../../owner-registration/edit-owner-details/edit-owner-details.component';
import { OwnerTransferService } from '../../owner-registration/owner-transfer/owner-transfer.service';
import { OwnerDetailsService } from '../../owner-registration/owner-details.service';
import { OwnerTransferDetailsEditComponent } from '../../owner-registration/owner-transfer-details-edit/owner-transfer-details-edit.component';
import { AnimalManagementService } from '../animal-management.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { OrgList } from '../models-animal-reg/org-list.model';
import { OwnerData } from '../../owner-registration/models-owner-reg/get-owner-details.model';
import {
  AnimalRegistrationList,
  CompleteOwnerDetails,
} from '../../owner-registration/models-owner-reg/get-ownerby-ownerID.model';
import { AnimalDetailService } from '../animal-details/animal-detail.service';
import { AnimalResult } from '../models-animal-reg/tagId-search.model';
import { ViewOrganizationComponent } from '../view-organization/view-organization.component';
import { filter } from 'rxjs/operators';
import { MasterConfig } from 'src/app/shared/master.config';
import { OwnerResponseDialogComponent } from '../../owner-registration/owner-response-dialog/owner-response-dialog.component';

interface takeOwnershipRes {
  animalId: number;
  transferStatus: string;
}
@Component({
  selector: 'app-take-ownership',
  templateUrl: './take-ownership.component.html',
  styleUrls: ['./take-ownership.component.css'],
  providers: [TranslatePipe],
})
export class TakeOwnershipComponent implements OnInit {
  masterConfig = MasterConfig;
  animalDetail: string[] = [];
  noOfActiveAnimals: number = 0;
  ownerDetailsRecord: OwnerData[] = [];
  noOfBoxes: number = 0;
  registeredAnimalRecord: AnimalTable[] = [];
  isOwnerTabVisible: boolean = false;
  isAnimalTabVisible: boolean = false;
  isOwnerActive = true;
  isTableVisible: boolean = false;
  isLoadingSpinner: boolean = false;
  soldFlag: boolean = false;
  searchForm!: FormGroup;
  searchTagIdForm!: FormGroup;
  ownerDetailsByID!: CompleteOwnerDetails;
  orgsList: OrgList[] = [];
  isOrgTabVisible: boolean = false;
  errorMessage: string = '';
  currentOwnerId: string = '';
  animalIds: string[] = [];
  animalData = [];
  // animalData: AnimalRegistrationList[] = [];
  private paginator!: MatPaginator;
  private animalPaginator!: MatPaginator;
  orgValue?: number;
  private sort!: MatSort;
  animalKeys: string[] = [
    'taggingDate',
    'tagId',
    'animalName',
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
  ];
  displayedColumns: string[] = [
    'sNo',
    'animalName',
    'tagId',
    'taggingDate',
    'species',
    'sex',
    'ageInMonths',
    'animalStatus',
    'action',
    'add',
  ];
  ownerSearchResult: string[] = [
    'sNo',
    'ownerId',
    'ownerName',
    'ownerMobileNo',
    'ownerDateOfBirth',
    'ownerGender',
    'villageName',
    'arrow',
  ];
  tableDataSource = new MatTableDataSource<AnimalRegistrationList>();
  tableDataSourceOwner = new MatTableDataSource<OwnerData>();

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }

  @ViewChild('paginatorRef') set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }

  @ViewChild('animalPaginatorRef') set animalMatPaginator(mp: MatPaginator) {
    this.animalPaginator = mp;
    this.setDataSourceAttributes();
  }

  constructor(
    private ownerTS: OwnerTransferService,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private ownerDS: OwnerDetailsService,
    private earTS: EarTagChangeService,
    private animalMS: AnimalManagementService,
    private animalDS: AnimalDetailService,
    private route: Router,
    private translatePipe: TranslatePipe,
    private readonly translateService: TranslateService
  ) {}

  ngOnInit(): void {
    // this.animalDS.getOrgs().subscribe((data: OrgList[]) => {
    //   this.orgsList = data;
    // });

    this.searchForm = this._formBuilder.group({
      // optRadio: ['individual'],
      searchValue: ['', [Validators.required, TagIdSearchValidation]],
    });

    this.searchTagIdForm = this._formBuilder.group({
      // optRadio: ['individual'],
      searchTagIdValue: ['', [Validators.required, TagIdSearchValidation]],
    });

    this.searchIfOwnerRegistered();
    this.searchIfAnimalRegistered();
    this.checkIfViewedandEdited();
  }

  setDataSourceAttributes() {
    this.tableDataSource.paginator = this.animalPaginator;
    this.tableDataSource.sort = this.sort;
    this.tableDataSourceOwner.paginator = this.paginator;
    this.tableDataSourceOwner.sort = this.sort;
  }

  searchIfAnimalRegistered() {
    var parent = this.animalDS.getParentComponent();
    if (parent == 'animalReg') {
      var ownerData = JSON.parse(sessionStorage.getItem('ownerData') || '');
      this.setSearchParams(ownerData);
      this.animalDS.setParentComponent('');
    }
  }

  searchIfOwnerRegistered() {
    if (this.animalDS.getAnimalRegFlag()) {
      var owner = this.animalDS.getOwnerData();
      this.setSearchParams(owner);
      this.animalDS.setAnimalRegFlag(false);
    }
  }

  checkIfViewedandEdited() {
    if (this.animalDS.getIfAlreadySearched()) {
      var ownerData = JSON.parse(sessionStorage.getItem('ownerData') || '');
      this.setSearchParams(ownerData);
      this.animalDS.setIfAlreadySearched(false);
    }
  }

  addForTransfer(clickedAnimalData: AnimalRegistrationList) {
    if (clickedAnimalData.animalStatusCd === 6) {
      if (this.animalData.indexOf(clickedAnimalData) === -1) {
        this.animalData.push(clickedAnimalData);
        console.log(this.animalData);
      }
    } else {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translatePipe.transform('common.info_label'),
          icon: 'assets/images/info.svg',
          message: this.translatePipe.transform('errorMsg.not_sold_out'),
          primaryBtnText: this.translatePipe.transform('common.ok_string'),
        },
        panelClass: 'common-info-dialog',
      });
    }
  }

  onClickingRemove(clickedAnimalData: string) {
    this.animalData.forEach((value, index) => {
      if (value == clickedAnimalData) this.animalData.splice(index, 1);
    });
  }

  checkIfInSelectedList(clickedAnimalData: AnimalRegistrationList): boolean {
    if (this.animalData.length > 0) {
      return this.animalData.includes(clickedAnimalData);
    } else {
      return false;
    }
  }

  takeOwnership() {
    let animalIds: Array<string> = [];
    for (let i = 0; i < this.animalData.length; i++) {
      animalIds.push(String(this.animalData[i].animalId));
    }
    let payload = {
      newOwnerId: this.ownerDetailsByID.ownerId,
      animalIds: animalIds,
    };
    console.log(payload);
    const dialogRef = this.dialog
      .open(OwnerResponseDialogComponent, {
        data: {
          disableIcon: true,
          title:
            this.translatePipe.transform('common.owner_id') +
            ': ' +
            this.ownerDetailsByID.ownerId,
          message:
            this.translatePipe.transform('animalDetails.take_ownership') +
              this.ownerDetailsByID?.ownerName || '--',
          primaryBtnText: this.translatePipe.transform('common.ok_string'),
          secondaryBtnText: this.translatePipe.transform('common.cancel'),
        },
        width: '500px',
      })
      .afterClosed()
      .subscribe((res: boolean) => {
        if (res) {
          this.ownerTS
            .takeOwnership(payload)
            .subscribe((returnedData: takeOwnershipRes) => {
              console.log(returnedData);
              this.dialog.open(ConfirmationDialogComponent, {
                data: {
                  title: this.translatePipe.transform('common.info_label'),
                  icon: 'assets/images/info.svg',
                  message: returnedData[0].transferStatus,
                  primaryBtnText:
                    this.translatePipe.transform('common.ok_string'),
                },
                panelClass: 'common-info-dialog',
              });
              this.tableDataSource.data.length = 0;
              this.searchTagIdForm.get('searchTagIdValue').setValue('');
            });
        } else {
          console.log('cancel');
        }
      });

    // dialogRef.afterClosed().subscribe((res) => {
    //   this.getOwnerDetailsByID(this.ownerDetailsByID?.ownerId);
    // });
    // dialogRef.componentInstance.onClosed.subscribe((res) => {
    //   this.getOwnerDetailsByID(this.ownerDetailsByID?.ownerId);
    // });
  }

  setSearchParams(owner: CompleteOwnerDetails) {
    if (owner.ownerId) {
      this.getOwnerDetailsByID(owner.ownerId);
      // this.searchForm.patchValue({ optRadio: 'individual' });
      // this.searchBy = 'individual';
    } else {
      // this.getOwnerDetailsByID(String(owner.orgId));
      // this.searchForm.patchValue({ optRadio: 'organization' });
      // this.orgValue = +owner.orgId;
      // this.searchBy = 'organization';
    }
  }

  // ownershipDialog() {
  //   let animalLoaned = 0;
  //   for (let animal of this.animalData) {
  //     if (animal.isLoanOnAnimal) {
  //       animalLoaned += 1;
  //     }
  //   }
  //   if (animalLoaned > 0) {
  //     new SnackBarMessage(this._snackBar).onSucessMessage(
  //       animalLoaned +
  //         ' ' +
  //         this.translatePipe.transform('errorMsg.loaned_animal'),
  //       'Ok',
  //       'right',
  //       'top',
  //       'red-snackbar'
  //     );
  //   } else {
  //     this.ownerTS.setAnimalIDs(this.animalIds);
  //     this.ownerTS.setAnimalData(this.animalData);
  //     const dialogRef = this.dialog.open(OwnerTransferDetailsEditComponent, {
  //       data: {
  //         oldOwnerId: this.ownerDetailsByID.ownerId
  //           ? this.ownerDetailsByID.ownerId
  //           : this.ownerDetailsByID.orgId,
  //       },
  //       width: '500px',
  //       height: '100vh',
  //       panelClass: 'custom-dialog-container',
  //       position: {
  //         right: '0px',
  //         top: '0px',
  //       },
  //     });
  //     dialogRef.afterClosed().subscribe((res) => {
  //       this.animalData.length = 0;
  //       if (this.ownerTS.getSoldFlagStatus()) {
  //         this.getOwnerDetailsByID(
  //           this.ownerDetailsByID.ownerId
  //             ? this.ownerDetailsByID.ownerId
  //             : this.ownerDetailsByID.orgId
  //         );
  //         this.ownerTS.setSoldFlagStatus(false);
  //       }
  //     });
  //     dialogRef.componentInstance.onClosed.subscribe(() => {
  //       this.animalData.length = 0;
  //       if (this.ownerTS.getSoldFlagStatus()) {
  //         this.getOwnerDetailsByID(this.ownerDetailsByID?.ownerId);
  //         this.ownerTS.setSoldFlagStatus(false);
  //       }
  //     });
  //   }
  // }

  resetValue() {
    this.searchForm.patchValue({ searchValue: '' });
    this.isTableVisible = false;
    this.isAnimalTabVisible = false;
    this.isOwnerTabVisible = false;
  }

  editOwnerDialog(isView?: boolean) {
    const dialogRef = this.dialog.open(EditOwnerDetailsComponent, {
      data: {
        ownerData: this.ownerDetailsByID,
        redirectLink: '/dashboard/animal/animalsearch',
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
        this.getOwnerDetailsByID(this.ownerDetailsByID?.ownerId);
        this.ownerDS.seteditDetailsFlag(false);
      }
    });
  }

  // viewOrgDetailsDialog() {
  //   const dialog = this.dialog.open(ViewOrganizationComponent, {
  //     data: { orgData: this.ownerDetailsByID },
  //     width: '500px',
  //     height: '100vh',
  //     panelClass: 'custom-dialog-container',
  //     position: {
  //       right: '0px',
  //       top: '0px',
  //     },
  //   });
  // }

  // checkAllBoxes(event: Event) {
  //   this.animalDetail.length = 0;
  //   this.animalData.length = 0;
  //   if ((event.target as HTMLInputElement)?.checked) {
  //     for (var i = 0; i < this.tableDataSource.filteredData.length; i++) {
  //       if (
  //         this.tableDataSource.filteredData[i].animalStatus.includes(
  //           'Active'
  //         ) &&
  //         !this.tableDataSource.filteredData[i].isLoanOnAnimal &&
  //         !this.tableDataSource.filteredData[i].fieldSubmittedforUpdate
  //       ) {
  //         this.animalData.push(this.tableDataSource.filteredData[i]);
  //       }
  //     }
  //   }
  // }

  // onSelectingSearchBy(event: Event) {
  //   this.searchBy = (event.target as HTMLInputElement)?.value;
  //   this.isAnimalTabVisible = false;
  //   this.isOwnerTabVisible = false;
  //   this.isOrgTabVisible = false;
  // }

  // checkIfInSelectedList(data: AnimalRegistrationList): boolean {
  //   if (this.animalData.length > 0) {
  //     return this.animalData.includes(data);
  //   } else {
  //     return false;
  //   }
  // }

  // openEarTagDialog() {
  //   const dialogRef = this.dialog.open(EarTagDialogComponent, {
  //     data: {
  //       tagNumber: this.animalData[0].tagId,
  //       animalId: this.animalData[0].animalId,
  //       taggingDate: this.animalData[0].taggingDate,
  //       registrationDate: this.animalData[0].registrationDate,
  //     },
  //     width: '500px',
  //   });
  //   dialogRef.afterClosed().subscribe((res) => {
  //     if (this.earTS.getEarFlagStatus()) {
  //       this.isOwnerTabVisible = false;
  //       this.isAnimalTabVisible = false;
  //       this.isOrgTabVisible = false;
  //       this.getOwnerDetailsByID(this.currentOwnerId);
  //     }
  //     this.animalData.length = 0;
  //     // this.appService.getCurrentUrl();
  //   });
  // }

  searchResults(searchValue: string) {
    // this.animalData = [];
    if (this.searchForm.invalid) {
      this.isTableVisible = false;
      this.isOwnerTabVisible = false;
      this.isAnimalTabVisible = false;
      this.searchForm.markAllAsTouched();
      if (!isNaN(Number(searchValue)) && searchValue.length > 0) {
        if (searchValue.length > 10) {
          this.errorMessage = this.translatePipe.transform(
            'errorMsg.check_field'
          );
        } else {
          this.errorMessage = this.translatePipe.transform(
            'errorMsg.mobile_start'
          );
        }
      } else if (searchValue.length == 0) {
        this.errorMessage = this.translatePipe.transform(
          'errorMsg.enter_value'
        );
      } else {
        if (!isNaN(Number(searchValue.slice(2)))) {
          this.errorMessage = this.translatePipe.transform(
            'errorMsg.invalid_onwerId'
          );
        } else {
          this.errorMessage = this.translatePipe.transform(
            'errorMsg.owner_name_err'
          );
        }
      }
      return;
    } else {
      if (
        (searchValue.length == 8 ||
          searchValue.length == 11 ||
          searchValue.length == 12) &&
        !isNaN(+searchValue)
      ) {
        this.getDetailsByTagID(searchValue);
      } else {
        this.errorMessage = '';
        this.isLoadingSpinner = true;
        this.ownerDS.getOwnerByMobile(searchValue).subscribe(
          (data: OwnerData[]) => {
            this.tableDataSourceOwner = new MatTableDataSource(data);
            this.ownerDetailsRecord = data;
            this.isLoadingSpinner = false;
            if (this.ownerDetailsRecord.length > 1) {
              this.isTableVisible = true;
              this.isOwnerTabVisible = false;
              this.isAnimalTabVisible = false;
            } else if (this.ownerDetailsRecord.length == 1) {
              this.isTableVisible = false;
              this.getOwnerDetailsByID(this.ownerDetailsRecord[0].ownerId);
            } else {
              this.checkSearchValidity();
            }
          },
          (error) => {
            this.isLoadingSpinner = false;
          }
        );
      }
    }
  }

  searchResultsByTagId(searchValue: string) {
    // this.animalData = [];
    // if (this.searchForm.invalid) {
    this.isTableVisible = false;
    this.isOwnerTabVisible = false;
    this.isAnimalTabVisible = false;
    this.searchForm.markAllAsTouched();
    if (!isNaN(Number(searchValue)) && searchValue.length > 0) {
      if (
        (searchValue.length == 8 ||
          searchValue.length == 11 ||
          searchValue.length == 12) &&
        !isNaN(+searchValue)
      ) {
        this.getDetailsByTagID(searchValue, true);
      } else if (searchValue.length == 0) {
        this.errorMessage = this.translatePipe.transform(
          'errorMsg.enter_value'
        );
      } else {
      }
      return;
    }
  }

  checkSearchValidity() {
    new SnackBarMessage(this._snackBar).onSucessMessage(
      this.translatePipe.transform('errorMsg.no_owner_found'),
      this.translatePipe.transform('animalDetails.ok'),
      'right',
      'top',
      'red-snackbar'
    );
    this.isTableVisible = false;
    this.isOwnerTabVisible = false;
    this.isAnimalTabVisible = false;
  }

  get searchInfo() {
    return this.searchForm.controls;
  }

  getDetailsByTagID(searchValue: string, onlyAnimalSearch?: boolean) {
    this.noOfActiveAnimals = 0;
    this.errorMessage = '';
    this.isLoadingSpinner = true;
    this.animalMS.getDetailsByTagID(searchValue).subscribe(
      (searchResult: AnimalResult) => {
        this.isLoadingSpinner = false;
        if (onlyAnimalSearch == undefined) {
          this.ownerDetailsByID = searchResult.ownerDetails;
        }
        var animalList = <AnimalRegistrationList>{};
        for (let key of this.animalKeys) {
          animalList[key] = searchResult[key];
        }
        if (searchResult?.animalId) {
          if (
            searchResult.isLoanOnAnimal &&
            searchResult?.animalStatus?.includes('Active') &&
            !searchResult?.fieldSubmittedforUpdate
          ) {
            this.noOfActiveAnimals += 1;
          }
        }
        this.tableDataSource = new MatTableDataSource([animalList]);
        this.isTableVisible = false;
        if (searchResult.ownerDetails.ownerId) {
          // this.searchForm.patchValue({ optRadio: 'individual' });
          // this.searchBy = 'individual';
          this.isOwnerTabVisible = true;
          this.isAnimalTabVisible = true;
        } else {
          this.isOrgTabVisible = true;
          // this.searchForm.patchValue({ optRadio: 'organization' });
          // this.searchBy = 'organization';
          this.isAnimalTabVisible = true;
        }
      },
      (error) => {
        this.isLoadingSpinner = false;
        this.isTableVisible = false;
        this.isOwnerTabVisible = false;
        this.isAnimalTabVisible = false;
      }
    );
  }

  getOwnerDetailsByID(ownerId: string) {
    this.noOfActiveAnimals = 0;
    this.isLoadingSpinner = true;
    this.currentOwnerId = ownerId;
    this.ownerDS.getOwnerByOwnerID(ownerId).subscribe(
      (data: CompleteOwnerDetails) => {
        this.isLoadingSpinner = false;
        this.ownerDetailsByID = data;
        this.isOwnerActive =
          this.ownerDetailsByID.registrationStatus == '2' ? false : true;
        // this.tableDataSource = new MatTableDataSource(
        //   this.ownerDetailsByID.animalsList
        // );
        this.isTableVisible = false;
        this.ownerTS.setOwnerName(
          this.ownerDetailsByID.ownerName
            ? this.ownerDetailsByID.ownerName
            : this.ownerDetailsByID.orgName
        );
        if (this.ownerDetailsByID?.orgId) {
          this.isOwnerTabVisible = false;
          this.isOrgTabVisible = true;
        } else {
          this.isOwnerTabVisible = true;
          this.isOrgTabVisible = false;
        }
        if (data.animalsList) {
          const animalList = data.animalsList;
          for (let i = 0; i < animalList.length; i++) {
            if (
              animalList[i].animalStatus.includes('Active') &&
              !animalList[i].isLoanOnAnimal &&
              !animalList[i].fieldSubmittedforUpdate
            ) {
              this.noOfActiveAnimals += 1;
            }
          }
        }
        this.isAnimalTabVisible = true;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  addInfoDialog() {
    const dialogRef = this.dialog.open(AddDetailsDialogComponent, {
      data: {
        ownerData: this.ownerDetailsByID,
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
      if (this.ownerDS.getAddDetailsFlag()) {
        this.getOwnerDetailsByID(this.ownerDetailsByID?.ownerId);
        this.ownerDS.setAddDetailsFlag(false);
      }
    });
  }

  onViewEdit(animalClicked: AnimalRegistrationList) {
    sessionStorage.setItem('parentPage', this.route.url);
    sessionStorage.setItem('ownerData', JSON.stringify(this.ownerDetailsByID));
    this.animalDS.setAnimalId(String(animalClicked.animalId));
  }

  dateFormatChange(date: String) {
    date = date.substring(0, 10);
    return date.split('-').reverse().join('/');
  }

  calculateAge(months: number) {
    const year = Math.floor(months / 12);
    const month = months % 12;
    return String(year) + 'Y' + ' ' + String(month) + 'M';
  }

  searchInTable(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableDataSource.filter = filterValue.trim().toLowerCase();
    if (this.tableDataSource.paginator) {
      this.tableDataSource.paginator.firstPage();
    }
  }

  searchInOwners(event: Event) {
    const filterOwnerValue = (event.target as HTMLInputElement).value;
    this.tableDataSourceOwner.filter = filterOwnerValue.trim().toLowerCase();
    if (this.tableDataSourceOwner.paginator) {
      this.tableDataSourceOwner.paginator.firstPage();
    }
  }

  // passOwnerData() {
  //   this.route.navigateByUrl('/dashboard/animal/addanimal');
  //   sessionStorage.setItem('ownerData', JSON.stringify(this.ownerDetailsByID));
  // }

  // getOrgDetails() {
  //   if (this.orgValue != 0 && String(this.orgValue).startsWith('2')) {
  //     this.getOwnerDetailsByID(String(this.orgValue));
  //   } else if (this.orgValue == undefined) {
  //     new SnackBarMessage(this._snackBar).onSucessMessage(
  //       'Please select an Organization.',
  //       'Ok',
  //       'right',
  //       'top',
  //       'red-snackbar'
  //     );
  //   } else {
  //     this.isOrgTabVisible = false;
  //     this.isAnimalTabVisible = false;
  //     new SnackBarMessage(this._snackBar).onSucessMessage(
  //       'Not a Valid Organization.',
  //       'Ok',
  //       'right',
  //       'top',
  //       'red-snackbar'
  //     );
  //   }
  // }
}
