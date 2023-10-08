import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Observable, from, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ManageAdditionalAreaAllocationComponent } from 'src/app/features/admin-management/user-management/manage-additional-area-allocation/manage-additional-area-allocation.component';
import { UserManagementService } from 'src/app/features/admin-management/user-management/user-management.service';
import { CountryService } from 'src/app/shared/shareService/country-service.service';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { TreatmentResponseDialogComponent } from '../../treatment-response-dialog/treatment-response-dialog.component';
import { IntimationReportService } from '../../intimation-report/intimation-report.service';
import { Village } from '../../intimation-report/models/village.model';
import { getSessionData } from 'src/app/shared/shareService/storageData';

@Component({
  selector: 'app-location-mapping-edit',
  templateUrl: './location-mapping-edit.component.html',
  styleUrls: ['./location-mapping-edit.component.css'],
  providers: [TranslatePipe]
})
export class LocationMappingEditComponent implements OnInit {
  validationMsg = animalHealthValidations.newCase;
  isLoadingSpinner: boolean = false
  masterData: any;
  selectedState;
  areaAllocation!: FormGroup;
  bindStateCd = "stateCd";
  bindStateCode = "stateCode";
  bindStateName = "stateName";
  bindDistrictCd = "districtCd";
  bindDistrictName = "districtName";
  bindTehsilCd = "tehsilCd";
  bindTehsilName = "tehsilName";
  bindVillageCd = "villageCd";
  bindvillageName = "villageName";
  panelOpenState = true;
  panelOpenDistrict = true;
  panelOpenTehsil = true;
  panelOpenVillage = true;
  stateSelected = null;
  districtSelected = null;
  tehsilSelected = null;
  districtMasterData: Observable<any>;
  tehsilMasterData: Observable<any>;
  villageMasterData: Observable<any>;
  sectionStr = "section"
  stateExpanded = false;
  districtExpanded = false;
  tehsilExpanded = false;
  villageExpanded = false;
  isLiveStackAdmin = false;
  temVillageList: Village[];
  villageForUser: Village[] = [];
  tehsilForUser: Village[] = [];
  districtForUser: Village[] = [];
  stateForUser: any[] = [];
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private _countryService: CountryService,
    private _fb: FormBuilder,
    private dialog: MatDialog,
    private userManagementService: UserManagementService,
    private dialogRef: MatDialogRef<ManageAdditionalAreaAllocationComponent>,
    private translate: TranslateService,
    private translatePipe: TranslatePipe,
    private intimationReportService: IntimationReportService) { }


  ngOnInit(): void {
    this.isLiveStackAdmin = getSessionData('adminUser'); //sessionStorage.getItem("isLivesatckAdmin") == "true";
    this.createForm();
    this.setSelectionData();
  }

  createForm() {
    this.areaAllocation = this._fb.group({
      selectedState: [],
      selectedDistrict: [],
      selectedTehsil: [],
      selectedVillage: []
    })
  }

  async setSelectionData() {
    if (!this.isLiveStackAdmin) {
      this.isLoadingSpinner = true;
      const userByVillage = await this.intimationReportService.getVillagesByUser().pipe(tap(() => this.isLoadingSpinner = false)).toPromise();
      this.bindUserData(userByVillage);
    }
    switch (this.data.areaSection) {
      case "state":
        this.setStateData();
        break;
      case "district":
        this.setDistrictData()
        break;
      case "tehsil":
        this.setTehsilData();
        break;
      case "village":
        this.setVillageData();
        break;
    }
  }

  bindUserData(res) {
    this.isLoadingSpinner = true;
    let vigg = {};
    this.temVillageList = res;
    this.villageForUser = res.filter((entries) => {
      if (vigg[entries.villageCd]) {
        return false;
      }
      vigg[entries.villageCd] = true;
      return true;
    });
    const teh = {};
    this.tehsilForUser = res.filter((entries) => {
      if (teh[entries.tehsilCd]) {
        return false;
      }
      teh[entries.tehsilCd] = true;
      return true;
    });
    const dist = {};
    this.districtForUser = res.filter((entries) => {
      if (dist[entries.districtCd]) {
        return false;
      }
      dist[entries.districtCd] = true;
      return true;
    });
    let state = {};
    this.stateForUser = res.filter((entries) => {
      if (state[entries.stateCd]) {
        return false;
      }
      state[entries.stateCd] = true;
      return true;
    });
    this.selectAllForDropdownItems(this.villageForUser);
    this.isLoadingSpinner = false;
  }

  async setStateData() {
    this.isLoadingSpinner = true;
    if (this.isLiveStackAdmin) {
      this.masterData = await this.userManagementService.getMultiState().pipe(tap(() => this.isLoadingSpinner = false));
    }
    else {
      this.masterData = of(this.stateForUser);
      this.isLoadingSpinner = false;
    }

    this.areaAllocation.patchValue({
      selectedState: this.data.selectedData[0]
    });
    this.areaAllocation.get('selectedState').addValidators([Validators.required]);
    this.areaAllocation.get('selectedDistrict').clearValidators();
    this.areaAllocation.get('selectedTehsil').clearValidators();
    this.areaAllocation.get('selectedVillage').clearValidators();
    this.areaAllocation.updateValueAndValidity();

  }

  async setDistrictData() {
    this.isLoadingSpinner = true;
    if (this.isLiveStackAdmin) {
      this.masterData = await this.userManagementService.getMultiDistricts(this.data.selectedParent).pipe(tap(() => this.isLoadingSpinner = false));
    }
    else {
      this.masterData = of(this.districtForUser.map((master) => {
        return {
          ...master,
          section: "district",
        }
      }));
      this.isLoadingSpinner = false;
    }
    this.areaAllocation.patchValue({
      selectedDistrict: this.data.selectedData
    });
    this.areaAllocation.get('selectedState').clearValidators();
    this.areaAllocation.get('selectedDistrict').addValidators([Validators.required]);
    this.areaAllocation.get('selectedTehsil').clearValidators();
    this.areaAllocation.get('selectedVillage').clearValidators();
  }

  async setTehsilData() {
    this.isLoadingSpinner = true;
    if (this.isLiveStackAdmin) {
      this.masterData = await this.userManagementService.getMultiTehsils(this.data.selectedParent).pipe(tap(() => this.isLoadingSpinner = false));
    }
    else {
      this.masterData = of(this.tehsilForUser.map((master) => {
        return {
          ...master,
          section: "tehsil",
        }
      }));
      this.isLoadingSpinner = false;
    }

    this.areaAllocation.patchValue({
      selectedTehsil: this.data.selectedData
    });
    this.areaAllocation.get('selectedState').clearValidators();
    this.areaAllocation.get('selectedDistrict').clearValidators();
    this.areaAllocation.get('selectedTehsil').addValidators([Validators.required]);
    this.areaAllocation.get('selectedVillage').clearValidators();
  }

  async setVillageData() {
    this.isLoadingSpinner = true;
    if (this.isLiveStackAdmin) {
      this.masterData = await this.userManagementService.getMultiVillages(this.data.selectedParent).pipe(tap(() => this.isLoadingSpinner = false));
    }
    else {
      this.masterData = of(this.villageForUser.map((master) => {
        return {
          ...master,
          section: "village",
        }
      }));
      this.isLoadingSpinner = false;
    }

    this.areaAllocation.patchValue({
      selectedVillage: this.data.selectedData
    })
    this.areaAllocation.get('selectedState').clearValidators();
    this.areaAllocation.get('selectedDistrict').clearValidators();
    this.areaAllocation.get('selectedTehsil').clearValidators();
    this.areaAllocation.get('selectedVillage').addValidators([Validators.required]);
  }

  onClickingRemove(index, areaName) {
    switch (areaName) {
      case "state":
        this.removeState(index)
        break;
      case "district":
        this.removeDistrict(index);
        break;
      case "tehsil":
        this.removeTehsil(index);
        break;
      case "village":
        this.removeVillage(index)
        break;
    }
  }

  //addition of area

  onAreaChange(areas: any, control: string, section: string) {
    this.isLoadingSpinner = true;
    const { selectedDistrict, selectedTehsil, selectedVillage } = this.data.areaAllocation;

    const setSelectedData = (controlValue: any) => {
      this.data.selectedData = controlValue;
    };

    const addUniqueItem = (selectedArray: Area[], newItem: Area, section?: string) => {
      switch (section) {
        case "state":
          break;
        case "district":
          var isExist = selectedArray.some((item) => item.districtCd === newItem.districtCd);
          break;
        case "tehsil":
          isExist = selectedArray.some((item) => item.tehsilCd === newItem.tehsilCd);
          break;
        case "village":
          isExist = selectedArray.some((item) => item.villageCd === newItem.villageCd);
          break;
      }

      if (!isExist) {
        selectedArray.push(newItem);
      }
    };

    const addStateChild = async (stateCodeList: number[]) => {
      const districtList = await this.userManagementService.getMultiDistricts(stateCodeList).toPromise();
      for (let district of districtList) {
        addUniqueItem(selectedDistrict, { ...district, districtCd: district.districtCd }, "district")
      }
      const tehsilList = await this.userManagementService.getMultiTehsils(districtList.map((dist) => dist.districtCd)).toPromise();
      for (let tehsil of tehsilList) {
        addUniqueItem(selectedTehsil, { ...tehsil, tehsilCd: tehsil.tehsilCd }, "tehsil")
      }
      const villageList = await this.userManagementService.getMultiVillages(tehsilList.map((teh) => teh.tehsilCd)).toPromise();
      for (let village of villageList) {
        addUniqueItem(selectedVillage, { ...village, villageCd: village.villageCd }, "village")
      }
    }

    const addDistrictChild = async (DistCodeList: number[]) => {
      const tehsilList = await this.userManagementService.getMultiTehsils(DistCodeList).toPromise();
      for (let tehsil of tehsilList) {
        addUniqueItem(selectedTehsil, { ...tehsil, tehsilCd: tehsil.tehsilCd }, "tehsil")
      }
      const villageList = await this.userManagementService.getMultiVillages(tehsilList.map((teh) => teh.tehsilCd)).toPromise();
      for (let village of villageList) {
        addUniqueItem(selectedVillage, { ...village, villageCd: village.villageCd }, "village")
      }
    }

    const addTehsilChild = async (tehsilCodeList: number[]) => {
      const villageList = await this.userManagementService.getMultiVillages(tehsilCodeList).toPromise();
      for (let village of villageList) {
        addUniqueItem(selectedVillage, { ...village, villageCd: village.villageCd }, "village")
      }
    }

    switch (section) {
      case "state":
        switch (control) {
          case "state":
            setSelectedData(this.areaAllocation.get('selectedState').value);
            if (this.areaAllocation.get('selectedState').value && this.areaAllocation.get('selectedState').value.length > 1) {
              let stateCodeList;
              if (!areas.stateCode) {
                stateCodeList = this.areaAllocation.get('selectedState').value.map(state => state.stateCode);
              }
              else {
                stateCodeList = [areas.stateCode];
              }
              addStateChild(stateCodeList);
            }
            break;
          case "district":
            let districtCodeList;
            const selectedDistData = this.areaAllocation.get('selectedDistrict').value;
            if (!areas.districtCd) {
              for (const district of selectedDistData) {
                addUniqueItem(selectedDistrict, { ...district, districtCd: district.districtCd }, control);
              }
              this.isLoadingSpinner = false;
              districtCodeList = selectedDistData.map((district) => district.districtCd);
            }
            else {
              addUniqueItem(selectedDistrict, { ...areas, districtCd: areas.districtCd }, control);
              this.areaAllocation.get('selectedDistrict').setValue(selectedDistrict.filter((dist) => dist.stateCd === this.stateSelected));
              districtCodeList = [areas.districtCd];
            }
            if (selectedDistData && selectedDistData.length > 1) addDistrictChild(districtCodeList);
            break;
          case "tehsil":
            let tehsilCodeList;
            const selectedTehData = this.areaAllocation.get('selectedTehsil').value;
            if (!areas.tehsilCd) {

              for (const teh of selectedTehData) {
                addUniqueItem(selectedTehsil, { ...teh, tehsilCd: teh.tehsilCd }, control);
              }
              tehsilCodeList = selectedTehsil.map((teh) => teh.tehsilCd);
              this.isLoadingSpinner = false;
            }
            else {
              addUniqueItem(selectedTehsil, { ...areas, tehsilCd: areas.tehsilCd }, control);
              this.areaAllocation.get('selectedTehsil').setValue(selectedTehsil.filter((teh) => teh.districtCd === this.districtSelected));
              tehsilCodeList = [areas.tehsilCd];
            }
            if (selectedTehData && selectedTehData.length > 1) addTehsilChild(tehsilCodeList);
            break;
          case "village":
            if (!areas.villageCd) {
              const selectedVillData = this.areaAllocation.get('selectedVillage').value;
              for (const village of selectedVillData) {
                addUniqueItem(selectedVillage, { ...village, tehsilCd: village.tehsilCd }, control);
              }
              this.isLoadingSpinner = false;
              return;
            }
            addUniqueItem(selectedVillage, { ...areas, villageCd: areas.villageCd }, control);
            this.areaAllocation.get('selectedVillage').setValue(selectedVillage.filter((teh) => teh.tehsilCd === this.tehsilSelected));
            break;
        }
        break;
      case "district":
        switch (control) {
          case "district":
            setSelectedData(this.areaAllocation.get('selectedDistrict').value);
            if (this.areaAllocation.get('selectedDistrict').value && this.areaAllocation.get('selectedDistrict').value.length > 1) {
              let districtCodeList;
              if (!areas.districtCd) {
                districtCodeList = this.areaAllocation.get('selectedDistrict').value.map((district) => district.districtCd);
              }
              else {
                districtCodeList = [areas.districtCd];
              }
              addDistrictChild(districtCodeList);
            }
            break;
          case "tehsil":
            let tehsilCodeList;
            const selectedTehData = this.areaAllocation.get('selectedTehsil').value;
            if (!areas.tehsilCd) {
              for (const teh of selectedTehData) {
                addUniqueItem(selectedTehsil, { ...teh, tehsilCd: teh.tehsilCd }, control);
              }
              tehsilCodeList = selectedTehsil.map((teh) => teh.tehsilCd);
              this.isLoadingSpinner = false;
            }
            else {
              addUniqueItem(selectedTehsil, { ...areas, tehsilCd: areas.tehsilCd }, control);
              this.areaAllocation.get('selectedTehsil').setValue(selectedTehsil.filter((teh) => teh.districtCd === this.districtSelected));
              tehsilCodeList = [areas.tehsilCd];
            }
            if (selectedTehData && selectedTehData.length > 1) addTehsilChild(tehsilCodeList);
            break;
          case "village":
            if (!areas.villageCd) {
              const selectedVillData = this.areaAllocation.get('selectedVillage').value;
              for (const village of selectedVillData) {
                addUniqueItem(selectedVillage, { ...village, tehsilCd: village.tehsilCd }, control);
              }
              this.isLoadingSpinner = false;
              return;
            }
            addUniqueItem(selectedVillage, { ...areas, villageCd: areas.villageCd }, control);
            this.areaAllocation.get('selectedVillage').setValue(selectedVillage.filter((teh) => teh.tehsilCd === this.tehsilSelected));
            break;
        }
        break;
      case "tehsil":
        switch (control) {
          case "tehsil":
            setSelectedData(this.areaAllocation.get('selectedTehsil').value);
            if (this.areaAllocation.get('selectedTehsil').value && this.areaAllocation.get('selectedTehsil').value.length > 1) {
              let tehsilCodeList;
              if (!areas.tehsilCd) {
                tehsilCodeList = this.areaAllocation.get('selectedTehsil').value.map(teh => teh.tehsilCd);
              }
              else {
                tehsilCodeList = [areas.tehsilCd];
              }
              addTehsilChild(tehsilCodeList);
            }
            break;
          case "village":
            if (!areas.villageCd) {
              const selectedVillData = this.areaAllocation.get('selectedVillage').value;
              for (const village of selectedVillData) {
                addUniqueItem(selectedVillage, { ...village, tehsilCd: village.tehsilCd }, control);
              }
              this.isLoadingSpinner = false;
              return;
            }
            addUniqueItem(selectedVillage, { ...areas, villageCd: areas.villageCd }, control);
            this.areaAllocation.get('selectedVillage').setValue(selectedVillage.filter((teh) => teh.tehsilCd === this.tehsilSelected));
            break;
        }
        break;
      case "village":
        setSelectedData(this.areaAllocation.get('selectedVillage').value);
        break;
    }
    this.isLoadingSpinner = false;
  }

  addStateChild(state) {

  }

  addDistrictChild(state) {

  }

  addTehsilChild(state) {

  }

  //additiona of area

  //removal for area

  async removeState(i) {
    let value = this.formControls.selectedState.value;
    let selectedState = value;
    const villageCount = this.data.areaAllocation.selectedVillage.reduce((accumulator, object) => {
      if (object.stateCd === value.stateCd) {
        accumulator += 1;
      }
      return accumulator;
    }, 0);
    if (villageCount) {
      var val = await this.dialog.open(TreatmentResponseDialogComponent, {
        data: {
          title: this.translatePipe.transform('common.info_label'),
          icon: 'assets/images/info.svg',
          message: `Are you sure you want to delete this state, ${villageCount} village(s) will be deleted.`,
          primaryBtnText: this.translatePipe.transform('common.yes'),
          secondaryBtnText: this.translatePipe.transform('common.no')
        },
        panelClass: 'common-info-dialog',
        width: '500px',
      }).afterClosed().toPromise()
    }
    if (val === false) return;
    if (this.stateSelected == value.stateCd) {
      this.stateSelected = null;
      this.districtSelected = null;
      this.tehsilSelected = null;
    }
    value = null
    this.formControls.selectedState.patchValue(value);
    this.formControls.selectedState.updateValueAndValidity();
    this.removeStateChild(selectedState);
  }

  removeStateChild(value: any) {
    // const districtControl = this.areaAllocation.get('selectedDistrict');
    // const tehsilControl = this.areaAllocation.get('selectedTehsil');
    // const villageControl = this.areaAllocation.get('selectedVillage');
    const stateCd = value.stateCd ?? value.stateCode
    this.data.areaAllocation.selectedDistrict = this.data.areaAllocation.selectedDistrict.filter((t) =>
      stateCd != t.stateCd
    );
    this.data.areaAllocation.selectedTehsil = this.data.areaAllocation.selectedTehsil.filter((t) =>
      stateCd != t.stateCd
    );
    this.data.areaAllocation.selectedVillage = this.data.areaAllocation.selectedVillage.filter((v) =>
      stateCd != v.stateCd
    );
    if (this.selectedState == stateCd) {
      this.selectedState = null;
    }
  }
  async removeDistrict(i) {
    const value = this.formControls.selectedDistrict.value;
    const areas = value[i];
    const villageCount = this.data.areaAllocation.selectedVillage.reduce((accumulator, object) => {
      if (object.districtCd === value[i].districtCd) {
        accumulator += 1;
      }
      return accumulator;
    }, 0);
    if (villageCount) {
      var val = await this.dialog.open(TreatmentResponseDialogComponent, {
        data: {
          title: this.translatePipe.transform('common.info_label'),
          icon: 'assets/images/info.svg',
          message: `Are you sure you want to delete this district, ${villageCount} village(s) will be deleted.`,
          primaryBtnText: this.translatePipe.transform('common.yes'),
          secondaryBtnText: this.translatePipe.transform('common.no')
        },
        panelClass: 'common-info-dialog',
        width: '500px',
      }).afterClosed().toPromise()
    }
    if (val === false) return;
    if (this.districtSelected === areas.districtCd) {
      this.districtSelected = null;
      this.tehsilSelected = null;
    }
    const isExist = this.data.areaAllocation.selectedDistrict.findIndex((dist) => dist.districtCd == areas.districtCd);
    if (isExist != -1) {
      this.data.areaAllocation.selectedDistrict.splice(isExist, 1);
    }
    value.splice(i, 1);
    this.formControls.selectedDistrict.patchValue(value);
    this.formControls.selectedDistrict.updateValueAndValidity();
    this.removeDistrictChild(areas);
  }

  removeDistrictChild(areas) {
    this.data.areaAllocation.selectedTehsil = this.data.areaAllocation.selectedTehsil.filter((t) =>
      t.districtCd != areas.districtCd
    );
    this.data.areaAllocation.selectedVillage = this.data.areaAllocation.selectedVillage.filter((v) =>
      v.districtCd != areas.districtCd
    );
  }

  async removeTehsil(i) {
    const value = this.formControls.selectedTehsil.value;
    const areas = value[i];
    const villageCount = this.data.areaAllocation.selectedVillage.reduce((accumulator, object) => {
      if (object.tehsilCd === value[i].tehsilCd) {
        accumulator += 1;
      }
      return accumulator;
    }, 0);
    if (villageCount) {
      var val = await this.dialog.open(TreatmentResponseDialogComponent, {
        data: {
          title: this.translatePipe.transform('common.info_label'),
          icon: 'assets/images/info.svg',
          message: `Are you sure you want to delete this tehsil, ${villageCount} village(s) will be deleted.`,
          primaryBtnText: this.translatePipe.transform('common.yes'),
          secondaryBtnText: this.translatePipe.transform('common.no')
        },
        panelClass: 'common-info-dialog',
        width: '500px',
      }).afterClosed().toPromise()
    }
    if (val === false) return;
    if (this.tehsilSelected === areas.tehsilCd) {
      this.tehsilSelected = null;
    }
    const isExist = this.data.areaAllocation.selectedTehsil.findIndex((dist) => dist.tehsilCd == areas.tehsilCd);
    if (isExist != -1) {
      this.data.areaAllocation.selectedTehsil.splice(isExist, 1);
    }
    value.splice(i, 1);
    this.formControls.selectedTehsil.patchValue(value);
    this.formControls.selectedTehsil.updateValueAndValidity();
    this.removeTehsilChild(areas);
  }

  removeTehsilChild(areas) {
    this.data.areaAllocation.selectedVillage = this.data.areaAllocation.selectedVillage.filter((v) =>
      v.tehsilCd != areas.tehsilCd
    );
  }

  removeVillage(i) {
    const value = this.formControls.selectedVillage.value;
    const areas = value[i];
    const isExist = this.data.areaAllocation.selectedVillage.findIndex((dist) => dist.villageCd == areas.villageCd);
    if (isExist != -1) {
      this.data.areaAllocation.selectedVillage.splice(isExist, 1);
    }
    value.splice(i, 1);
    this.formControls.selectedVillage.patchValue(value);
    this.formControls.selectedVillage.updateValueAndValidity();
  }

  removeVillageChild(areas) {

  }

  async onAreaRemove(areas: any, control: string, section: string) {
    const stateControl = this.areaAllocation.get('selectedState');
    const districtControl = this.areaAllocation.get('selectedDistrict');
    const tehsilControl = this.areaAllocation.get('selectedTehsil');
    const villageControl = this.areaAllocation.get('selectedVillage');
    const showConfirmationDialog = async (message: string): Promise<boolean> => {
      const val = await this.dialog
        .open(TreatmentResponseDialogComponent, {
          data: {
            title: this.translatePipe.transform('common.info_label'),
            icon: 'assets/images/info.svg',
            message,
            primaryBtnText: this.translatePipe.transform('common.yes'),
            secondaryBtnText: this.translatePipe.transform('common.no')
          },
          panelClass: 'common-info-dialog',
          width: '500px',
        })
        .afterClosed()
        .toPromise();

      return val === false;
    };

    const removeState = async (stateMaster) => {
      const villageMaster = this.data.areaAllocation.selectedVillage;
      const villageCount = stateMaster.reduce((acc, state) => {
        acc += villageMaster.filter((area) => area.stateCd === state.stateCode)?.length;
        return acc;
      }, 0);
      if (villageCount && (await showConfirmationDialog(`Are you sure you want to delete this state, ${villageCount} village(s) will be deleted.`))) {
        stateControl.setValue([...stateControl?.value, ...stateMaster]);
        return;
      }
      this.stateSelected = null;
      this.districtSelected = null;
      this.tehsilSelected = null;

      for (let state of stateMaster) {
        this.removeStateChild(state);
      }
    };

    const removeDistrict = async (districtMaster) => {
      districtControl.setValue([...districtControl?.value, ...districtMaster]);
    };

    const removeTehsil = async (tehsilMaster) => {
      tehsilControl.setValue([...tehsilControl?.value, ...tehsilMaster]);
    };

    const removeVillage = () => {
      if (!areas?.value?.villageCd) return;
      const isExistVillage = this.data.areaAllocation.selectedVillage.findIndex((dist) => dist.villageCd == areas.value.villageCd);
      if (isExistVillage != -1) {
        this.data.areaAllocation.selectedVillage.splice(isExistVillage, 1);
      }
    };

    switch (section) {
      case AreaType.State:
        switch (control) {
          case AreaType.State:
            if (!areas?.value?.stateCode) {
              this.isLoadingSpinner = true;
              const stateMaster = await this.masterData.toPromise();
              this.isLoadingSpinner = false;
              removeState(stateMaster);
            } else {
              const villageCount = this.data.areaAllocation.selectedVillage.reduce((accumulator, object) => {
                if ((object.stateCd === areas?.value?.stateCode) || (object.stateCd === areas?.stateCode || (object.stateCd === areas?.stateCd))) {
                  accumulator += 1;
                }
                return accumulator;
              }, 0);

              if (villageCount && (await showConfirmationDialog(`Are you sure you want to delete this state, ${villageCount} village(s) will be deleted.`))) {
                stateControl.setValue([...stateControl?.value, areas?.value]);
                return;
              }

              if (this.stateSelected == areas.value.stateCd) {
                this.stateSelected = null;
                this.districtSelected = null;
                this.tehsilSelected = null;
              }

              this.removeStateChild(areas);
            }
            break;
          case AreaType.District:
            if (!areas?.value?.districtCd) {
              this.isLoadingSpinner = true;
              const districtMaster = await this.districtMasterData.toPromise();
              this.isLoadingSpinner = false;
              await removeDistrict(districtMaster);
            } else {
              districtControl?.setValue([...districtControl?.value, areas?.value]);
            }
            break;
          case AreaType.Tehsil:
            if (!areas?.value?.tehsilCd) {
              this.isLoadingSpinner = true;
              const tehsilMaster = await this.tehsilMasterData.toPromise();
              this.isLoadingSpinner = false;
              await removeTehsil(tehsilMaster);
            } else {
              tehsilControl.setValue([...tehsilControl.value, areas?.value]);
            }
            break;
          case AreaType.Village:
            removeVillage();
            break;
        }
        break;
      case AreaType.District:
        switch (control) {
          case AreaType.District:
            if (!areas?.value?.districtCd) {
              this.isLoadingSpinner = true
              const districtMaster = await this.masterData.toPromise();
              this.isLoadingSpinner = false;
              await removeDistrict(districtMaster);
            } else {
              districtControl?.setValue([...districtControl?.value, areas?.value]);
            }
            break;
          case AreaType.Tehsil:
            if (!areas?.value?.tehsilCd) {
              this.isLoadingSpinner = true;
              const tehsilMaster = await this.tehsilMasterData.toPromise();
              this.isLoadingSpinner = false;
              await removeTehsil(tehsilMaster);
            } else {
              tehsilControl.setValue([...tehsilControl.value, areas?.value]);
            }
            break;
          case AreaType.Village:
            removeVillage();
            break;
        }
        break;
      case AreaType.Tehsil:
        switch (control) {
          case AreaType.Tehsil:
            if (!areas?.value?.tehsilCd) {
              this.isLoadingSpinner = true
              const tehsilMaster = await this.masterData.toPromise();
              this.isLoadingSpinner = false;
              await removeTehsil(tehsilMaster);
            } else {
              tehsilControl.setValue([...tehsilControl.value, areas?.value]);
            }
            break;
          case AreaType.Village:
            removeVillage();
            break;
        }
        break;
      case AreaType.Village:
        removeVillage();
        break;
    }
  }

  async changeState(areas: any, control: string, section: string) {
    const stateControl = this.areaAllocation.get('selectedState');
    const showConfirmationDialog = async (message: string): Promise<boolean> => {
      const val = await this.dialog
        .open(TreatmentResponseDialogComponent, {
          data: {
            title: this.translatePipe.transform('common.info_label'),
            icon: 'assets/images/info.svg',
            message,
            primaryBtnText: this.translatePipe.transform('common.yes'),
            secondaryBtnText: this.translatePipe.transform('common.no')
          },
          panelClass: 'common-info-dialog',
          width: '500px',
        })
        .afterClosed()
        .toPromise();

      return val === false;
    };

    const removeState = async (stateMaster) => {
      const villageMaster = this.data.areaAllocation.selectedVillage;
      const villageCount = stateMaster.reduce((acc, state) => {
        acc += villageMaster.filter((area) => area.stateCd === state.stateCode)?.length;
        return acc;
      }, 0);
      if (villageCount && (await showConfirmationDialog(`Are you sure you want to change the state, ${villageCount} village(s) will be deleted.`))) {
        stateControl.setValue([...stateControl?.value, ...stateMaster]);
        return;
      }
      this.stateSelected = null;
      this.districtSelected = null;
      this.tehsilSelected = null;

      for (let state of stateMaster) {
        this.removeStateChild(state);
      }
    };

    if (!areas?.stateCode && !areas?.stateCd) {
      this.isLoadingSpinner = true;
      const stateMaster = await this.masterData.toPromise();
      this.isLoadingSpinner = false;
      removeState(stateMaster);
    } else {
      const villageCount = this.data.areaAllocation.selectedVillage.reduce((accumulator, object) => {
        if ((object.stateCd === areas?.stateCode || (object.stateCd === areas?.stateCd))) {
          accumulator += 1;
        }
        return accumulator;
      }, 0);

      if (villageCount && (await showConfirmationDialog(`Are you sure you want to change the state, ${villageCount} village(s) will be deleted.`))) {
        stateControl.setValue(areas);
        return;
      }

      if (this.stateSelected == areas?.stateCd) {
        this.stateSelected = null;
        this.districtSelected = null;
        this.tehsilSelected = null;
      }

      this.removeStateChild(areas);
    }
  }

  //removal for area

  get formControls() {
    return this.areaAllocation.controls;
  }

  getStateDetails(state) {
    this.isLoadingSpinner = true;
    if (!this.stateSelected || (this.stateSelected != state.stateCd && this.stateSelected != state.stateCode)) {
      this.panelOpenState = false;
      this.stateSelected = state.stateCd ?? state.stateCode;
      this.districtSelected = null;
      this.tehsilSelected = null;
      this.districtMasterData = this.userManagementService.getMultiDistricts([this.stateSelected]);
      this.districtMasterData.subscribe((district: any) => {
        const tempDist = district.filter((distM: any) => this.data.areaAllocation.selectedDistrict.some((dist) => dist.districtCd == distM.districtCd));
        this.areaAllocation.patchValue({
          selectedDistrict: tempDist
        });
        this.isLoadingSpinner = false;
      })
    }
    else {
      this.stateSelected = null;
      this.districtSelected = null;
      this.tehsilSelected = null;
      this.panelOpenState = true;
      this.isLoadingSpinner = false;
    }

  }

  getDistrictDetails(district) {
    this.isLoadingSpinner = true;
    if (!this.districtSelected || (this.districtSelected != district.districtCd && this.districtSelected != district.districtCd)) {
      this.panelOpenDistrict = false;
      this.tehsilSelected = null;
      this.districtSelected = district.districtCd ?? district.districtCd;
      this.tehsilMasterData = this.userManagementService.getMultiTehsils([this.districtSelected]);
      this.tehsilMasterData.subscribe((teshil: any) => {
        const tempTeh = teshil.filter((distM: any) => this.data.areaAllocation.selectedTehsil.some((dist) => dist.tehsilCd == distM.tehsilCd));
        this.areaAllocation.patchValue({
          selectedTehsil: tempTeh
        });
        this.isLoadingSpinner = false;
      })
    }
    else {
      this.districtSelected = null;
      this.panelOpenDistrict = true;
      this.isLoadingSpinner = false;
    }

  }

  getTehsilDetails(tehsil) {
    this.isLoadingSpinner = true;
    if (!this.tehsilSelected || (this.tehsilSelected != tehsil.tehsilCd && this.tehsilSelected != tehsil.tehsilCd)) {
      this.panelOpenTehsil = false;
      this.tehsilSelected = tehsil.tehsilCd ?? tehsil.tehsilCd;
      this.villageMasterData = this.userManagementService.getMultiVillages([this.tehsilSelected]);
      this.villageMasterData.subscribe((village: any) => {
        const tempVill = village.filter((distM: any) => this.data.areaAllocation.selectedVillage.some((dist) => dist.villageCd == distM.villageCd));
        this.areaAllocation.patchValue({
          selectedVillage: tempVill
        });
        this.isLoadingSpinner = false;
      })
    }
    else {
      this.tehsilSelected = null;
      this.panelOpenTehsil = true;
      this.isLoadingSpinner = false;
    }

  }

  selectAllStates($event) {
    console.log($event);
  }

  saveNewAreaAllocation() {
    if (this.areaAllocation.invalid) {
      this.areaAllocation.markAllAsTouched();
      return;
    }
    this.dialogRef.close({
      areaSection: this.data.areaSection,
      data: this.areaAllocation.value,
      childSection: this.data.areaAllocation
    });
  }

  compareDistrictFunction(item, selected) {
    return item.districtCd === selected.districtCd
  }

  compareTehsilFunction(item, selected) {
    return item.tehsilCd === selected.tehsilCd
  }

  compareVillageFunction(item, selected) {
    return item.villageCd === selected.villageCd
  }

  selectAllForDropdownItems(items: any[]) {
    let allSelect = (items) => {
      items.forEach((element) => {
        element['selectedAllGroup'] = 'selectedAllGroup';
      });
    };

    allSelect(items);
  }


  localFilterDistrict() {

  }
  localFilterTehsil() {

  }
  localFilterVillage() {

  }

}

enum AreaType {
  State = "state",
  District = "district",
  Tehsil = "tehsil",
  Village = "village",
}

interface Area {
  districtCd?: string | number;
  tehsilCd?: string | number;
  villageCd?: string | number;
  stateCd?: string | number;
  stateCode?: string | number;
}

interface Data {
  selectedData: any; // Adjust the type based on your actual data structure
  areaAllocation: {
    selectedDistrict: Area[];
    selectedTehsil: Area[];
    selectedVillage: Area[];
  };
}
