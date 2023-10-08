import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ManageAdditionalAreaAllocationComponent } from '../manage-additional-area-allocation/manage-additional-area-allocation.component';
import { TreatmentResponseDialogComponent } from 'src/app/features/animal-health/treatment-response-dialog/treatment-response-dialog.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { UserManagementService } from '../user-management.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-additional-area-allocation',
  templateUrl: './additional-area-allocation.component.html',
  styleUrls: ['./additional-area-allocation.component.css'],
  providers: [TranslatePipe]
})
export class AdditionalAreaAllocationComponent implements OnInit, OnChanges {
  @Input() stateAllList: any;
  @Input() userId: any;
  @Input() additionalAreaAllocations: any;
  @Output() deleteAreaAllocation = new EventEmitter<boolean>();
  isLoadingSpinner: boolean = false;
  selectedState: any[] = [];
  selectedDistrict: any[] = [];
  selectedTehsil: any[] = [];
  selectedVillage: any[] = [];
  stateMaster = [];
  constructor(private dialog: MatDialog,
    private translatePipe: TranslatePipe,
    private userService: UserManagementService,
    private translateService: TranslateService) { }


  ngOnInit(): void {
    this.mapArea();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.stateAllList) {
      this.stateMaster = changes.stateAllList.currentValue;
    }
  }

  mapArea() {

    this.selectedState = Array.from(new Set(this.additionalAreaAllocations.map(obj => obj.stateCd)))
      .map(stateCd => this.additionalAreaAllocations.find(obj => obj.stateCd === stateCd));


    this.selectedDistrict = Array.from(new Set(this.additionalAreaAllocations.map(obj => obj.districtCd)))
      .map(districtCd => this.additionalAreaAllocations.find(obj => obj.districtCd === districtCd));

    this.selectedTehsil = Array.from(new Set(this.additionalAreaAllocations.map(obj => obj.tehsilCd)))
      .map(tehsilCd => this.additionalAreaAllocations.find(obj => obj.tehsilCd === tehsilCd));

    for (let villageList of this.additionalAreaAllocations) {
      for (let i = 0; i < villageList.villageCd.length; i++) {
        this.selectedVillage.push({
          stateCd: villageList.stateCd,
          stateName: villageList.stateName,
          districtCd: villageList.districtCd,
          districtName: villageList.districtName,
          tehsilCd: villageList.tehsilCd,
          tehsilName: villageList.tehsilName,
          villageCd: villageList.villageCd[i],
          villageName: villageList.villageName[i]
        })
      }
    }
  }

  manageAreaAllocation(areaSection: string) {
    var selectedParent;
    var selectedData;
    switch (areaSection) {
      case "state":
        selectedParent = [];
        selectedData = this.selectedState.slice();
        break;
      case "district":
        selectedParent = [...new Set(this.selectedState.map(state => state.stateCd))];
        selectedData = this.selectedDistrict.slice();
        break;
      case "tehsil":
        selectedParent = [...new Set(this.selectedDistrict.map(district => district.districtCd))];
        selectedData = this.selectedTehsil.slice();
        break;
      case "village":
        selectedParent = [...new Set(this.selectedTehsil.map(tehsil => tehsil.tehsilCd))];
        selectedData = this.selectedVillage.slice();
        break;
    }
    const areaAllocation = {
      selectedState: this.selectedState.slice(),
      selectedDistrict: this.selectedDistrict.slice(),
      selectedTehsil: this.selectedTehsil.slice(),
      selectedVillage: this.selectedVillage.slice()
    }
    const dialogRef = this.dialog.open(ManageAdditionalAreaAllocationComponent, {
      width: '100vw',
      height: '100vh',
      panelClass: 'custom-dialog-container',
      disableClose: true,
      data: {
        stateMaster: this.stateMaster,
        selectedParent,
        selectedData,
        areaSection,
        areaAllocation
      },
    }).afterClosed().subscribe((res) => {
      if (res) {
        this.updateAreaAllocation(res);
      }
    });
  }

  updateAreaAllocation(res) {
    switch (res.areaSection) {
      case "state":
        this.selectedState = res.data.selectedState.map((state: any) => {
          return {
            stateCd: state.stateCd ?? state.stateCode,
            stateName: state.stateName
          }
        });
        this.selectedDistrict = res.childSection.selectedDistrict;
        this.selectedTehsil = res.childSection.selectedTehsil;
        this.selectedVillage = res.childSection.selectedVillage;
        break;
      case "district":
        this.selectedDistrict = res.data.selectedDistrict;
        this.selectedTehsil = res.childSection.selectedTehsil;
        this.selectedVillage = res.childSection.selectedVillage;
        break;
      case "tehsil":
        this.selectedTehsil = res.data.selectedTehsil;
        this.selectedVillage = res.childSection.selectedVillage;
        break;
      case "village":
        this.selectedVillage = res.data.selectedVillage
        break;
    }
  }

  async deleteAreaAllocationConfirmation() {
    var isConfirmDelete = await this.dialog.open(TreatmentResponseDialogComponent, {
      data: {
        title: this.translatePipe.transform('common.info_label'),
        icon: 'assets/images/info.svg',
        message: this.translatePipe.transform('common.area_allocation_delete_confirm'),
        primaryBtnText: this.translatePipe.transform('common.yes'),
        secondaryBtnText: this.translatePipe.transform('common.no')
      },
      panelClass: 'common-info-dialog',
      width: '500px',
    }).afterClosed().toPromise()

    if (isConfirmDelete) {
      this.isLoadingSpinner = true;
      const AreaAssign = [{
        userId: this.userId
      }]
      this.userService.updateUserArea(AreaAssign).subscribe((res: any) => {
        this.isLoadingSpinner = false;
        this.dialog.open(ConfirmationDialogComponent, {
          data: {
            title: this.translateService.instant('common.info_label'),
            message: this.translateService.instant(
              'common.area_allocation_deleted'
            ),
            primaryBtnText:
              this.translateService.instant('common.ok_string'),
            errorFlag: true,
            icon: 'assets/images/info.svg',
          },
          width: '500px',
          panelClass: 'common-info-dialog',
        });
        this.selectedDistrict = [];
        this.selectedState = [];
        this.selectedTehsil = [];
        this.selectedVillage = [];
        this.deleteAreaAllocation.emit(true);
        return;
      });
    }
  }

  saveNewAreaAllocation() {

  }

}
