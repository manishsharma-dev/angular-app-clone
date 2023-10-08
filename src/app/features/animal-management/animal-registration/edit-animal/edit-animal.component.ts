import { Router } from '@angular/router';
import { OwnerDetailsService } from './../../owner-registration/owner-details.service';
import { AnimalDetails } from './../models-animal-reg/animal-details.model';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AnimalRegistrationList } from '../../owner-registration/models-owner-reg/get-ownerby-ownerID.model';
import { AddInfoDialogComponent } from '../add-info-dialog/add-info-dialog.component';
import { AnimalDetailService } from '../animal-details/animal-detail.service';
import { EditAnimalDetailsComponent } from '../edit-animal-details/edit-animal-details.component';
import { ViewTransactionsDialogComponent } from '../view-transactions-dialog/view-transactions-dialog.component';
import { CommonData } from '../../owner-registration/models-owner-reg/common-data.model';
import { AnimalManagementService } from '../animal-management.service';
import { OtpDialogComponent } from 'src/app/shared/otp-dialog/otp-dialog.component';
import { MasterConfig } from 'src/app/shared/master.config';
import { AppService } from 'src/app/shared/shareService/app.service';
import { OwnerTransferDialogComponent } from '../../owner-registration/owner-transfer-dialog/owner-transfer-dialog.component';
import moment from 'moment';

@Component({
  selector: 'app-edit-animal',
  templateUrl: './edit-animal.component.html',
  styleUrls: ['./edit-animal.component.css'],
})
export class EditAnimalComponent implements OnInit {
  masterConfig = MasterConfig;
  animalDetails!: AnimalRegistrationList;
  customTagID: string = '';
  animalId: string = '';
  sessionAnimalId: string = '';
  completeAnimalDetails!: AnimalDetails;
  isLoadingSpinner: boolean = false;
  isLoading: boolean = false;
  timeOfDeath = '';
  imageSrc: string = '';
  editOptions: CommonData[] = [];
  coatColour: string = '';
  isAnimalActive = true;
  fieldUpdated: string = '';

  constructor(
    public dialog: MatDialog,
    private animalDS: AnimalDetailService,
    private ownerDS: OwnerDetailsService,
    private router: Router,
    private animalMS: AnimalManagementService,
    private appService: AppService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.ownerDS.getCommonData('field_changed').subscribe((editFields) => {
      this.editOptions = editFields;
    });
    this.animalId = this.animalDS.getAnimalId();
    if (this.animalId) {
      sessionStorage.setItem('animalId', String(this.animalId));
    }
    this.sessionAnimalId = sessionStorage.getItem('animalId') || '';
    if (this.sessionAnimalId) {
      this.getAnimalDetails(this.sessionAnimalId);
    }
  }

  formatExoticLevel(level: string) {
    return parseFloat(level).toFixed(2);
  }

  findFieldPendingApproval() {
    for (let field of this.editOptions) {
      if (field.value == this.completeAnimalDetails?.fieldSubmittedforUpdate) {
        this.fieldUpdated = field.value.replace("'", '');
      }
    }
  }

  currentAnimalDetails() {
    this.customTagID = String(this.completeAnimalDetails.tagId);
    this.customTagID =
      this.customTagID.substring(0, 4) +
      '-' +
      this.customTagID.substring(4, 8) +
      '-' +
      this.customTagID.substring(8, 12);
  }

  formatDateAndTime(value: string) {
    let dateAndTime = value?.split(' ');
    let date = new Date(dateAndTime[0]);
    if (!this.timeOfDeath) {
      this.timeOfDeath = moment(new Date(value)).format('HH:mm');
      this.cdRef.detectChanges();
    }
    return moment(date).format('DD/MM/YYYY');
  }

  openEditAnimalDialog() {
    const dialogRef = this.dialog.open(EditAnimalDetailsComponent, {
      data: {
        animalData: this.completeAnimalDetails,
        animalId: this.completeAnimalDetails?.animalId,
        tagId: this.completeAnimalDetails?.tagId,
        gender: this.completeAnimalDetails?.sex,
        pregnancyStatus: this.completeAnimalDetails?.pregnancyStatus,
      },
      width: '500px',
    });
    dialogRef.afterClosed().subscribe((res) => {
      this.appService.getModulebyUrl(
        sessionStorage.getItem('parentPage').slice(10)
      );
      const performSearch = this.animalMS.getEditAnimal();
      if (performSearch) {
        this.getAnimalDetails(this.sessionAnimalId);
      }
    });
  }

  openAddInfoDialog() {
    const dialogRef = this.dialog.open(AddInfoDialogComponent, {
      data: {
        animalData: this.completeAnimalDetails,
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
      this.appService.getModulebyUrl(
        sessionStorage.getItem('parentPage').slice(10)
      );
      if (this.animalMS.getAdditionalDetails()) {
        this.getAnimalDetails(sessionStorage.getItem('animalId')!);
        this.animalMS.setAdditionalDetails(false);
      }
    });
  }

  openTransactionsDialog() {
    const dialogRef = this.dialog.open(ViewTransactionsDialogComponent, {
      data: { animalId: this.completeAnimalDetails?.animalId },
      width: '500px',
      height: '100vh',
      panelClass: 'custom-dialog-container',
      position: {
        right: '0px',
        top: '0px',
      },
    });
    dialogRef.afterClosed().subscribe((res) => {});
  }

  formatDate(d: any) {
    return moment(d.split(' ')[0]).format('DD/MM/YYYY');
  }

  calculateAge(months: number) {
    if (months) {
      const year = Math.floor(months / 12);
      const month = months % 12;
      return String(year) + 'Y' + ' ' + String(month) + 'M';
    } else {
      return (this.completeAnimalDetails?.ageInDays || '0') + ' days';
    }
  }

  getAnimalDetails(animalId: string) {
    this.isLoadingSpinner = true;
    this.isLoading = true;
    this.animalDS.getAnimalDetails(animalId).subscribe(
      (animalDetails: AnimalDetails) => {
        this.completeAnimalDetails = animalDetails;
        this.isAnimalActive =
          this.completeAnimalDetails.animalStatusCd == 7 ? false : true;
        if (this.completeAnimalDetails?.fieldSubmittedforUpdate) {
          this.findFieldPendingApproval();
        }
        if (this.completeAnimalDetails.imagePreviewUrl) {
          this.isLoading = false;
        }
        this.isLoadingSpinner = false;
        this.ownerDS.getCommonData('animal_coat_colour').subscribe((colour) => {
          colour.forEach((colour) => {
            if (colour.cd == String(this.completeAnimalDetails.coatColourCd)) {
              this.coatColour = colour.value;
            }
          });
        });
        this.currentAnimalDetails();
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  downloadAnimalImage() {
    let formData = new FormData();
    formData.append('imageKey', '1661783016036_download.jpg');
    this.animalDS.downloadAnimal(formData).subscribe((res) => {});
  }

  checkIfEditInProgress(fieldName: string): boolean {
    if (fieldName == this.fieldUpdated) {
      return true;
    }
    return false;
  }

  openOwnershipDialog() {
    const dialogRef = this.dialog.open(OwnerTransferDialogComponent, {
      data: {
        isReverify: true,
        currentOwner:
          this.completeAnimalDetails.ownerDetails.ownerName ||
          this.completeAnimalDetails.ownerDetails.orgName,
        animalIds: [this.completeAnimalDetails.animalId],
      },
      width: '500px',
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (this.sessionAnimalId) {
        this.getAnimalDetails(this.sessionAnimalId);
      }
    });
  }

  openOtpDialog() {
    if (
      this.completeAnimalDetails.registrationStatus != '3' &&
      this.completeAnimalDetails.animalStatusCd === 7
    ) {
      return;
    } else {
      const dialogRef = this.dialog.open(OtpDialogComponent, {
        data: {
          isDisplayIcon: true,
          ownerId: this.completeAnimalDetails?.ownerId,
          header: 'Animal Tag-Id:' + String(this.completeAnimalDetails?.tagId),
          heading: 'Animal Verification',
          message: "To verify the animal, please verify owner's mobile number",
          link: '/dashboard/animal/editanimal',
          name: 'ownerRegistrationSuccess',
          animalId: this.completeAnimalDetails?.animalId,
          otp: '1234',
          ownerMobileNo: this.completeAnimalDetails.ownerDetails.ownerMobileNo
            ? String(this.completeAnimalDetails?.ownerDetails.ownerMobileNo)
            : String(this.completeAnimalDetails?.ownerDetails?.orgMobileNo),
        },
        width: '500px',
      });
      dialogRef.afterClosed().subscribe((res) => {});
      dialogRef.componentInstance.onClosed.subscribe((res) => {
        if (this.sessionAnimalId) {
          this.getAnimalDetails(this.sessionAnimalId);
        }
      });
    }
  }

  redirectToSearch() {
    this.animalDS.setIfAlreadySearched(true);
    this.router.navigateByUrl(sessionStorage.getItem('parentPage'));
  }
}
