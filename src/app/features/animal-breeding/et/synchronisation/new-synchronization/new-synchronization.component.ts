import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { animalBreedingPRConfig } from 'src/app/shared/animal-breeding-pr.config';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { DataServiceService } from 'src/app/shared/shareService/data-service.service';
import { SaveDialogComponent } from '../../../pregnancy-diagnosis/save-dialog/save-dialog.component';
import { EtService } from '../../et.service';
export interface TableData {
  tagId: string;
  species: any;
  breed: string;
  syncDate: string;
  drugUsed: string;
  animalId: string;
}

@Component({
  selector: 'app-new-synchronization',
  templateUrl: './new-synchronization.component.html',
  styleUrls: ['./new-synchronization.component.css'],
  providers: [TranslatePipe],
})
export class NewSynchronizationComponent implements OnInit {
  data: TableData[] = [];
  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  displayColumns = [
    'sr_no',
    'tagId',
    'species',
    'breed',
    'syncDate',
    'drugUsed',
  ];
  rows: FormArray = this._fb.array([]);
  form: FormGroup = this._fb.group({ sync: this.rows });
  isLoadingSpinner: boolean = false;
  isLinear = false;
  addEmbryoMasterForm: FormGroup;
  currentDate = sessionStorage.getItem('serverCurrentDateTime')
  ownerId: number;
  breedingMinDate = '';
  drugList = [];
  animalData = [];
  constructor(
    private _fb: FormBuilder,
    private etService: EtService,
    private dialog: MatDialog,
    private router: Router,
    private dataService: DataServiceService,
    private translatePipe: TranslatePipe
  ) {}

  ngOnInit(): void {
    const animalData = JSON.parse(sessionStorage.getItem('animalData'));
    this.animalData = animalData;
    this.getAnimalTableData(animalData);
    this.getDrugList();

    this.dataService
      .getDefaultConfig(animalBreedingPRConfig.backdate.ETSyncBackdate)
      .subscribe((config) => {
        this.breedingMinDate = moment(this.currentDate)
          .subtract(config.defaultValue, 'days')
          .format('YYYY-MM-DD');
      });

    this.rows.valueChanges.subscribe((value) => {
      if (!value || !value.length) {
        return;
      }

      for (const [index, row] of value.entries()) {
        const selectedDate = moment(row.syncDate);

        const taggingDate = moment(this.animalData[index].taggingDate);

        if (selectedDate.isBefore(taggingDate)) {
          this.dialog
            .open(ConfirmationDialogComponent, {
              data: {
                title: this.translatePipe.transform('common.info_label'),
                message: this.translatePipe.transform(
                  'performanceRecording.please_select_date_after_animal_tagging_date'
                ),
                primaryBtnText:
                  this.translatePipe.transform('common.ok_string'),
                icon: 'assets/images/alert.svg',
              },
              panelClass: 'common-info-dialog',
            })
            .afterClosed()
            .subscribe(() => this.rows.at(index).get('syncDate').reset());
        }
      }
    });
  }

  get minDate() {
    return moment(this.currentDate).subtract(this.breedingMinDate, 'days').format('YYYY-MM-DD');
  }

  get today() {
    return moment(this.currentDate).format('YYYY-MM-DD');
  }

  saveSyncDetail(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoadingSpinner = true;

    const formValue = {
      ...this.form.value,
    };
    this.etService
      .saveSyncDetails(formValue?.sync)
      .pipe(
        switchMap((res: any) => {
         const getTransactionID = this.getTransationIDs(res)
          return this.dialog
            .open(SaveDialogComponent, {
              data: {
                title: 'animalDetails.sync_detail_submit',
                 transaction_id: getTransactionID,
              },
              width: '500px',
            })
            .afterClosed();
        })
      )
      .subscribe(
        (res) => {
          this.isLoadingSpinner = false;
          this.gotoPreviousScreen();
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
  }
  addRow(d?: TableData, noUpdate?: boolean) {
    const row = this._fb.group({
      animalId: [d?.animalId, []],
      drugUsed: [d?.drugUsed ? d?.drugUsed : null, [Validators.required]],
      syncDate: [d?.syncDate, [Validators.required]],
      tagId: [d?.tagId, []],
      species: [d?.species, []],
      breed: [d?.breed, []],
      modifiedBy: 'Test',
      createdBy: 'Test',
    });
    this.rows.push(row);
    if (!noUpdate) {
      this.updateView();
    }
  }
  updateView() {
    this.dataSource.next(this.rows.controls);
  }
  gotoPreviousScreen(): void {
    this.router.navigate(['./dashboard/animal-breeding/et/syncronization'], {
      queryParams: { ownerId: this.ownerId },
    });
  }
  private getDrugList(): void {
    this.isLoadingSpinner = true;

    this.etService.getCommonMaster('drug_used').subscribe(
      (data: any) => {
        this.isLoadingSpinner = false;
        this.drugList = data;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }
  private getAnimalTableData(data: any): void {
    if (data && data?.length > 0) {
      this.ownerId = data[0].ownerId;
      data.forEach((element) => {
        const syncObj = {
          animalId: element?.animalId,
          drugUsed: '',
          syncDate: '',
          tagId: element?.tagId,
          species: element?.species,
          breed: element?.breed,
        };
        this.addRow(syncObj);
      });
    }else{
      this.gotoPreviousScreen()
    }
  }

  ngOnDestroy() {
    sessionStorage.removeItem('animalData');
  }
  getTransationIDs(data:any):void{
    if(data && data?.length > 0){
      const permittedValues = data?.map(function(value) {
        return value.etSyncId;
      });
     return permittedValues && permittedValues?.length > 0 ?
             permittedValues.join() :null
    }
 
}
}
