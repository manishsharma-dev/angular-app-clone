import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { UserManagementService } from '../user-management.service';

@Component({
  selector: 'app-new-area-allocation',
  templateUrl: './new-area-allocation.component.html',
  styleUrls: ['./new-area-allocation.component.css'],
})
export class NewAreaAllocationComponent implements OnInit, OnChanges {
  @Input() stateAllList: any;
  isLoadingSpinner = false;
  validationMsg = animalHealthValidations.campaignCreation;
  areaAllocationForm!: FormGroup;
  stateMaster: any = [];
  districtMaster: any = [];
  tehsilMaster: any = [];
  villageMaster: any = [];

  constructor(
    private _fb: FormBuilder,
    private _userManagementService: UserManagementService
  ) { }

  ngOnInit(): void {
    //this.getStateMaster();
    this.createForm();

    this.formChangeEvents();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.stateAllList) {
      this.stateMaster = changes?.stateAllList?.currentValue;
      if (this.stateMaster && this.stateMaster.length) {
        this.stateMaster = this.stateMaster.map((state) => {
          return {
            ...state,
            section: "state"
          }
        })
      }
    }
  }

  formChangeEvents() {
    this.areaAllocationForm.get('stateCd').valueChanges.subscribe((data) => {
      this.manageStateChanges(data);
    });
    this.areaAllocationForm
      .get('selectedDistrict')
      .valueChanges.subscribe((data) => {
        this.manageDistrictChanges(data);
      });
    this.areaAllocationForm
      .get('selectedTehsil')
      .valueChanges.subscribe((data) => {
        this.manageTehsilChanges(data);
      });
  }

  createForm() {
    this.areaAllocationForm = this._fb.group({
      stateCd: [[], Validators.required],
      selectedDistrict: [[], Validators.required],
      selectedTehsil: [[], Validators.required],
      selectedVillage: [[], Validators.required],
    });
  }

  get f() {
    return this.areaAllocationForm.controls;
  }

  // getStateMaster() {
  //   this.isLoadingSpinner = true;
  //   this._userManagementService.getMultiState().subscribe((state: any) => {
  //     this.stateMaster = state;
  //     this.isLoadingSpinner = false;
  //   }, err => {
  //     this.isLoadingSpinner = false;
  //   });
  // }

  getDistrictByStateList(stateList: any) {
    this.isLoadingSpinner = true;
    this._userManagementService.getMultiDistricts(stateList).subscribe(
      (district: any) => {
        this.districtMaster = district;
        this.isLoadingSpinner = false;
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  getTehsilByDistrictList(districtList: any) {
    this.isLoadingSpinner = true;
    this._userManagementService.getMultiTehsils(districtList).subscribe(
      (tehsil: any) => {
        this.tehsilMaster = tehsil;
        this.isLoadingSpinner = false;
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  getVillageByDistrictList(tehsilList: any) {
    this.isLoadingSpinner = true;
    this._userManagementService.getMultiVillages(tehsilList).subscribe(
      (village: any) => {
        this.villageMaster = village;
        this.isLoadingSpinner = false;
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  manageStateChanges(data) {
    const stateCdList = data?.map((state) => state.stateCode) ?? [];
    this.areaAllocationForm.patchValue(
      {
        selectedDistrict: [],
        selectedTehsil: [],
        selectedVillage: [],
      },
      { emitEvent: false }
    );
    if (stateCdList.length > 1) {
      this.areaAllocationForm
        .get('selectedDistrict')
        .disable({ emitEvent: false });
      this.areaAllocationForm
        .get('selectedTehsil')
        .disable({ emitEvent: false });
      this.areaAllocationForm
        .get('selectedVillage')
        .disable({ emitEvent: false });
    } else {
      this.areaAllocationForm
        .get('selectedDistrict')
        .enable({ emitEvent: false });
      this.areaAllocationForm
        .get('selectedTehsil')
        .enable({ emitEvent: false });
      this.areaAllocationForm
        .get('selectedVillage')
        .enable({ emitEvent: false });
    }
    this.getDistrictByStateList(stateCdList);
  }

  manageDistrictChanges(data) {
    const distCdList = data?.map((dist) => dist.districtCd) ?? [];
    this.areaAllocationForm.patchValue(
      {
        selectedTehsil: [],
        selectedVillage: [],
      },
      { emitEvent: false }
    );
    if (distCdList.length > 1) {
      this.areaAllocationForm
        .get('selectedTehsil')
        .disable({ emitEvent: false });
      this.areaAllocationForm
        .get('selectedVillage')
        .disable({ emitEvent: false });
    } else {
      this.areaAllocationForm
        .get('selectedTehsil')
        .enable({ emitEvent: false });
      this.areaAllocationForm
        .get('selectedVillage')
        .enable({ emitEvent: false });
    }
    this.getTehsilByDistrictList(distCdList);
  }

  manageTehsilChanges(data) {
    const tehCdList = data?.map((teh) => teh.tehsilCd) ?? [];
    this.areaAllocationForm.patchValue(
      {
        selectedVillage: [],
      },
      { emitEvent: false }
    );
    if (tehCdList.length > 1) {
      this.areaAllocationForm
        .get('selectedVillage')
        .disable({ emitEvent: false });
    } else {
      this.areaAllocationForm
        .get('selectedVillage')
        .enable({ emitEvent: false });
    }
    this.getVillageByDistrictList(tehCdList);
  }
}
