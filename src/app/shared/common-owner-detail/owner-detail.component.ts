import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ViewOrganizationComponent } from 'src/app/features/animal-management/animal-registration/view-organization/view-organization.component';
import { EditOwnerDetailsComponent } from 'src/app/features/animal-management/owner-registration/edit-owner-details/edit-owner-details.component';
import { OwnerDetailsService } from 'src/app/features/animal-management/owner-registration/owner-details.service';

@Component({
  selector: 'app-common-owner-detail',
  templateUrl: './owner-detail.component.html',
  styleUrls: ['./owner-detail.component.css'],
})
export class CommonOwnerDetailComponent implements OnInit {
  @Input() ownerDetailsByID: any;
  @Output() editQwnerDetails = new EventEmitter();
  @Output() openOtpDialog = new EventEmitter();
  constructor(public dialog: MatDialog, private ownerDS: OwnerDetailsService) {}

  ngOnInit(): void {}

  editOwnerDialog(isView?: boolean) {
    const dialogRef = this.dialog.open(EditOwnerDetailsComponent, {
      data: {
        ownerData: this.ownerDetailsByID,
        redirectLink: '/dashboard/owner/ownersearch',
        isView: isView ? true : false,
        isIndividual: this.ownerDetailsByID?.ownerTypeCd === 1,
        ...this.ownerDetailsByID?.panNumber,
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
        this.editQwnerDetails.emit(true);
        this.ownerDS.seteditDetailsFlag(false);
      }
    });
  }

  otpDialog(value: string) {
    this.openOtpDialog.emit(value);
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
}
