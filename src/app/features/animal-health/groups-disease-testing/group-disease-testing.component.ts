import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { HealthService } from '../health.service';
import { WithoutCamVillages } from '../vaccination/models/campaign-village.model';
import { GroupDialogComponent } from './group-dialog/group-dialog.component';

export interface MedicineListModel {
  sr_no: string;
  tag_id: string;
  category_species: string;
  breed: string;
  sex: string;
  pregnancy_status: string;
  age: string;
  village: string;
  milking_status: string;
}

const ELEMENT_DATA_medicine: MedicineListModel[] = [
  {
    sr_no: '01',
    tag_id: '123423451256',
    category_species: 'Cattle',
    breed: 'Murrah',
    sex: 'F',
    age: '5y 7m',
    pregnancy_status: 'NA',
    village: 'Ambe',
    milking_status: 'No',
  },
  {
    sr_no: '02',
    tag_id: '456712561234',
    category_species: 'Buffalo',
    breed: 'Murrah',
    sex: 'F',
    age: '5y 7m',
    pregnancy_status: 'NA',
    village: 'Ambe',
    milking_status: 'NA',
  },
  {
    sr_no: '03',
    tag_id: '234512564567',
    category_species: 'Cattle',
    breed: 'Angus',
    sex: 'F',
    age: '5y 7m',
    pregnancy_status: 'No',
    village: 'Ambe',
    milking_status: 'No',
  },
  {
    sr_no: '04',
    tag_id: '345612561234',
    category_species: 'Buffalo',
    breed: 'Murrah',
    sex: 'F',
    age: '5y 7m',
    pregnancy_status: 'NA',
    village: 'Ambe',
    milking_status: 'No',
  },
  {
    sr_no: '05',
    tag_id: '125623451256',
    category_species: 'Cattle',
    breed: 'Angus',
    sex: 'F',
    age: '5y 7m',
    pregnancy_status: 'No',
    village: 'Ambe',
    milking_status: 'NA',
  },
];

@Component({
  selector: 'app-group-disease-testing',
  templateUrl: './group-disease-testing.component.html',
  styleUrls: ['./group-disease-testing.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class GroupDiseaseTestingComponent implements OnInit {
  validationMsg = animalHealthValidations.poolDiseaseTesting;
  isLoadingSpinner: boolean = false;
  @Input() firFlag;
  @Output() newFormSelected = new EventEmitter();
  spotTestingDisplayedColumns: string[] = [
    'checkbox',
    'sr_no',
    'tag_id',
    'category_species',
    'breed',
    'sex',
    'age',
    'pregnancy_status',
    'milking_status',
    'village',
  ];
  spotsTestingDisplayedColumns: string[] = [
    'sr_no',
    'tag_id',
    'category_species',
    'breed',
    'sex',
    'age',
    'pregnancy_status',
    'milking_status',
    'village',
  ];
  dataSource = new MatTableDataSource(ELEMENT_DATA_medicine);
  animalDetail: MedicineListModel[] = [];
  noOfBoxes: number = 0;
  selectAnimalForm: FormGroup;
  testingDetailForm: FormGroup;
  totalVillageList: WithoutCamVillages[] = [];
  step = 0;
  diseaseTestingForm: FormGroup;
  submitStatus = {
    selectAnimalForm: true,
    testingDetailForm: false,
  };

  constructor(
    private dialog: MatDialog,
    private _fb: FormBuilder,
    private _healthService: HealthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.diseaseTestingForm = this._fb.group({
      section: [{ value: '1', disabled: this.firFlag ? true : false }, [Validators.required]],
      poolValue: [0, [Validators.max(100), Validators.min(0)]],
    });
    this.selectAnimalForm = this._fb.group({
      village: [],
    });
    this.testingDetailForm = this._fb.group({
      record_date: [],
      date_of_testing: [],
      disease_suspected: [],
      sample_type: [],
      test_type: [],
      lab_test_type: [],
      plan_id: [],
      lab_sample_type: [],
      examination_type: [],
      examination_sub_type: [],
      lab: [],
      lab_charges: [],
      receipt_no: [],
      mode_of_transport: [],
      onSpotTesting: ['no'],
      sampleforLabTesting: ['no'],
    });
    //this.getMasterData();
    if (this.firFlag) {
      this.diseaseTestingForm.patchValue({
        section: '2'
      })
    }
    this.diseaseTestingForm.get('section').valueChanges.subscribe((val: any) => {
      this.diseaseTestingForm.get('poolValue').patchValue(0);
    })
  }
  // onFilter() {
  //   this.dataSource.filter = this.filterForm.get('filter').value;
  //    this.animalDetail = this.animalDetail.filter(value=>this.dataSource.filteredData.includes(value))
  // }

  getMasterData() {
    this.isLoadingSpinner = true;
    this._healthService.getVillagesbyUserID().subscribe(
      (data: any[]) => {
        this.totalVillageList = data ? data : [];
        if (data.length === 1) {
          this.selectAnimalForm.patchValue({
            village: data[0].villageCd.toString(),
          });
          this.villageSelected(data[0].villageCd);
        }
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  villageSelected(villageCode) { }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  checkAllBoxes(event) {
    this.animalDetail.length = 0;
    if (event.target.checked) {
      for (var i = 0; i < this.dataSource.filteredData.length; i++) {
        this.animalDetail.push(this.dataSource.filteredData[i]);
      }
    }
  }

  onCheckboxChange(event, element: MedicineListModel) {
    if (event.target.checked) {
      this.animalDetail.push(element);
    } else {
      this.animalDetail.forEach((value, index) => {
        if (value.tag_id === element.tag_id) this.animalDetail.splice(index, 1);
      });
    }
    this.noOfBoxes = this.animalDetail.length;
  }

  checkIfInSelectedList(element: MedicineListModel) {
    return this.animalDetail.includes(element);
  }

  onClickingRemove(element: MedicineListModel) {
    this.animalDetail.forEach((value, index) => {
      if (value.tag_id === element.tag_id) this.animalDetail.splice(index, 1);
    });
  }

  get formControls() {
    return this.diseaseTestingForm.controls;
  }

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  // dialog
  groupDialogSubmit() {
    const dialogRef = this.dialog.open(GroupDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((res) => { });
  }

  routetoPreviousResult() {
    if (this.firFlag) {

    }
    else {
      this.router.navigate(['dashboard/group-disease-testing/previous-disease-testing-results']);
    }
  }
  newFormGroupSelected($event) {
    this.newFormSelected.emit($event);
  }
}
