import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MasterConfig } from 'src/app/shared/master.config';
import { setEncryptedData } from 'src/app/shared/shareService/storageData';
import { ViewMoreDialogComponent } from '../../deworming/view-more-dialog/view-more-dialog.component';
import { HealthService } from '../../health.service';
import { TreatmentResponseDialogComponent } from '../../treatment-response-dialog/treatment-response-dialog.component';
import { Animal } from '../../vaccination/models/animal.model';

@Component({
  selector: 'app-pool-disease-testing',
  templateUrl: './pool-disease-testing.component.html',
  styleUrls: ['./pool-disease-testing.component.css'],
  providers: [TranslatePipe],
})
export class PoolDiseaseTestingComponent implements OnInit {
  masterConfig = MasterConfig;
  @Output() newFormSelected = new EventEmitter();
  isLoadingSpinner: boolean = false;
  isAnimalTableVisible = true;
  noAnimalRegistered = false;
  errorMessage = null;
  @Input() poolAnimalCount: any;
  @Input() isPool: any;
  @Input() firFlag: any;
  @ViewChild('animalSearch') animalSearch;
  untaggedAnimals: number = 0;
  constructor(
    public dialog: MatDialog,
    private _healthService: HealthService,
    private translatePipe: TranslatePipe,
    private readonly translateService: TranslateService,
    private router: Router
  ) {}

  ngOnInit(): void {}

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

  onClickingRemove(element: Animal) {
    this.animalSearch?.animalDetail.forEach((value, index) => {
      if (value.tagId === element.tagId)
        this.animalSearch?.animalDetail.splice(index, 1);
    });
  }

  onReset() {
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
    this.animalSearch.animalDetail.length = 0;
    this.errorMessage = null;
    //this.totalAnimalCount = { totalAnimalCount: null };
    this.isAnimalTableVisible = false;
    this.animalSearch?.searchForm.reset();
    this.animalSearch.dataSource.data = [];
  }

  onSubmit() {
    if (
      !this.animalSearch?.poolAnimalCount ||
      this.animalSearch?.poolAnimalCount > 100
    ) {
      this._healthService.handleError({
        title: this.translateService.instant('common.info_label'),
        message: this.translateService.instant('diseaseTesting.pool_count'),
        primaryBtnText: this.translateService.instant('common.ok_string'),
      });
      return;
    }
    if (
      !this.animalSearch?.animalDetail.length &&
      this.animalSearch?.searchForm.invalid
    ) {
      this.animalSearch?.searchForm.markAllAsTouched();
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
    const sharedData = {
      poolCount: this.animalSearch.poolAnimalCount,
      tagIdList: this.animalSearch.animalDetail,
      village: this.animalSearch?.searchForm.value.searchValue,
    };
    const storageData = {
      id: sharedData,
      type: 'poolDiseaseSelectedAnimal',
    };
    setEncryptedData(storageData, 'AESSHA256pdAnimal');
    if (this.firFlag) {
      this.newFormSelected.emit(true);
    }
    {
      this.router.navigate(['/dashboard/group-disease-testing/new-pool-test']);
    }
  }
}
