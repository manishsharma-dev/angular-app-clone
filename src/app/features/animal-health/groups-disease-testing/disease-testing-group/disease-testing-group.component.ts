import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { OwnerDetailsService } from 'src/app/features/animal-management/owner-registration/owner-details.service';
import { AnimalHealthConfig } from 'src/app/shared/animal-health.config';
import { MasterConfig } from 'src/app/shared/master.config';
import { setEncryptedData } from 'src/app/shared/shareService/storageData';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { AnimalTreatmentService } from '../../animal-treatment/animal-treatment.service';
import { Animal } from '../../deworming/models/animal.model';
import { ViewMoreDialogComponent } from '../../deworming/view-more-dialog/view-more-dialog.component';
import { HealthService } from '../../health.service';
import { TreatmentResponseDialogComponent } from '../../treatment-response-dialog/treatment-response-dialog.component';

@Component({
  selector: 'app-disease-testing-group',
  templateUrl: './disease-testing-group.component.html',
  styleUrls: ['./disease-testing-group.component.css'],
  providers: [TranslatePipe],
})
export class DiseaseTestingGroupComponent implements OnInit {
  masterConfig = MasterConfig;
  @Input() firFlag;
  @Output() newFormSelected = new EventEmitter();
  isLoadingSpinner: boolean = false;
  searchForm: FormGroup;
  errorMessage: string = '';
  villageMaster = [];
  dataSource = new MatTableDataSource([]);
  tableForm: FormGroup;
  isAnimalTableVisible = true;
  noAnimalRegistered = false;
  selectedAnimals = [];
  animalDetail: Animal[] = [];
  ownerDetailsByID: any;
  isTableVisible: boolean = false;
  noDataFound: boolean = false;
  displayedColumns = [
    'checkbox',
    'sr_no',
    'tag_id',
    'category_species',
    'breed',
    'sex',
    'age',
    'pregnancy_status',
    'village',
    'dob',
    'health_history',
  ];
  noOfBoxes = 0;
  validationMsg = animalHealthValidations.groupDiseaseTesting;
  constructor(
    private _fb: FormBuilder,
    private _healthService: HealthService,
    public dialog: MatDialog,
    private treatmentService: AnimalTreatmentService,
    private ownerDS: OwnerDetailsService,
    private readonly translateService: TranslateService,
    private router: Router,
    private translatePipe: TranslatePipe
  ) { }

  @ViewChild(MatSort) set sort(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  @ViewChild('animalSearch') animalSearch;

  ngOnInit(): void {
    this.searchForm = this._fb.group({
      searchValue: [null, [Validators.required]],
    });

    this.tableForm = this._fb.group({});

    this.searchForm.get('searchValue').valueChanges.subscribe((param: any) => {

    });
  }

  resetValue() { }

  get formControls() {
    return this.searchForm.controls;
  }

  onClickingRemove(element: Animal) {
    this.animalSearch?.animalDetail.forEach((value, index) => {
      if (value.tagId === element.tagId)
        this.animalSearch?.animalDetail.splice(index, 1);
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ViewMoreDialogComponent, {
      width: '700px',
      height: '80vh',
      panelClass: 'custom-dialog-container',
      data: {
        selectedTagIds: this.animalSearch?.animalDetail,
      },
    });
  }

  onSubmit() {
    if (!this.animalSearch?.animalDetail.length) {
      this._healthService.handleError({
        title: this.translatePipe.transform('errorMsg.no_animal_selected'),
        message: this.translatePipe.transform(
          'errorMsg.please_select_atleast_one_animal'
        ),
        primaryBtnText: this.translatePipe.transform('common.ok_string'),
      });
      return;
    }
    if (
      this.animalSearch?.animalDetail.some(
        (animal: any) => animal.animalStatusCd != 1
      )
    ) {
      this._healthService.handleError({
        title: this.translatePipe.transform(
          'errorMsg.inactive_animal_selected'
        ),
        message: this.translatePipe.transform(
          'errorMsg.please_select_only_active_animal_to_create_disease_testing'
        ),
        primaryBtnText: this.translatePipe.transform('common.ok_string'),
      });
      return;
    }
    const tagIdList = this.animalSearch.animalDetail;
    const storageData = {
      id: tagIdList,
      type: 'groupDiseaseSelectedAnimal',
    };
    setEncryptedData(storageData, 'AESSHA256gdAnimal');
    if (this.firFlag) {
      this.newFormSelected.emit(true);
    } else {
      this.router.navigate(['/dashboard/group-disease-testing/new-group-test']);
    }
  }

  onReset() {
    this.animalDetail.length = 0;
    this.errorMessage = null;
    //this.totalAnimalCount = { totalAnimalCount: null };
    this.dialog
      .open(TreatmentResponseDialogComponent, {
        data: {
          title: this.translateService.instant('diseaseTesting.warning'),
          icon: 'assets/images/info.svg',
          message: this.translateService.instant(
            'diseaseTesting.reset_the_page'
          ),
          primaryBtnText: this.translateService.instant('registration.Yes'),
          secondaryBtnText: this.translateService.instant('registration.No'),
        },
        panelClass: 'common-info-dialog',
      })
      .afterClosed()
      .subscribe((res: boolean) => {
        if (res) {
          this.animalSearch.resetValue();
        }
      });

    this.isAnimalTableVisible = false;
    this.searchForm.reset();
    this.dataSource.data = [];
  }
}
