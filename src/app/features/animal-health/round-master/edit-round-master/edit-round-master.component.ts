import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { RoundMasterService } from '../round-master.service';
import { TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { HealthService } from '../../health.service';
import { ViewRoundMaster } from '../models/viewRoundMaster.model';
import { catchError } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { IntimationReportService } from '../../intimation-report/intimation-report.service';
import { Village } from '../../intimation-report/models/village.model';
import { AnimalHealthConfig } from 'src/app/shared/animal-health.config';
import { EditRoundMaster } from '../models/editRound.model';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-edit-round-master',
  templateUrl: './edit-round-master.component.html',
  styleUrls: ['./edit-round-master.component.css']
})
export class EditRoundMasterComponent implements OnInit {
  isLoadingSpinner = false;
  itemForm: FormGroup;
  state: Village[] = [];
  temStateList: Village[];
  prescriptionRes!: ViewRoundMaster;
  diseaseRes!: ViewRoundMaster;
  dataEntryEndDate!: string;
  toDate!: string;
  fromDate!: string;
  newStringstateName: string;
  newStringDiseaseName: string;
  newStringDiseaseCd: number;
  newStringRemarks: string;

  public isShowError: string = '';
  roundMinEndDate: string;
  roundMaxEndDate: string;
  roundMinStartDate: string;
  roundMaxStartDate: Date;
  roundMinEntryEndDate: string;
  selectedStartDate: string;
  SubmitReport: EditRoundMaster[] = [];
  Successmessage: EditRoundMaster[] = [];
  constructor(private roundService: RoundMasterService,
    private readonly translateService: TranslateService,
    private intimationReportService: IntimationReportService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA)
    public data: { element },
    private healthService: HealthService) { }

  ngOnInit(): void {
    this.itemForm = new FormGroup({
      "selectedState": new FormControl('', [Validators.required]),
      "roundSD": new FormControl({ value: '', disabled: true }, [Validators.required]),
      "roundEndDate": new FormControl('', [Validators.required]),
      "roundRD": new FormControl({ value: moment(this.today).format('DD/MM/YYYY'), disabled: true },
        [Validators.required]),
      "remarks": new FormControl(''),
      "campaignId": new FormControl(''),
      "roundNo": new FormControl(''),
      "diseaseCd": new FormControl('')
    });
    this.intimationReportService.getVillagesByUser(AnimalHealthConfig.campaignUserID.toString()).subscribe(res => {
      let dist = {};
      this.temStateList = res;
      this.state = res.filter((entries) => {
        if (dist[entries.districtCd]) {
          return false;
        }
        dist[entries.districtCd] = true;
        return true;
      })

      this.selectAllForDropdownItems(this.state);
      this.isLoadingSpinner = false;
    },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
    this.getMasterData();
  }

  getMasterData() {
    const viewReport = this.roundService.viewRoundService(this.data.element.roundNo, this.data.element.stateCd, this.data.element.diseaseCd).pipe(catchError((err) => of(null)));
    this.isLoadingSpinner = true;
    forkJoin([viewReport]).subscribe(([viewRes]) => {
      if (this.healthService.isErrorResponse(viewRes)) {
        return;
      }
      this.isLoadingSpinner = false;
      for (let prescriptionRes of viewRes) {
        this.prescriptionRes = prescriptionRes.roundNo;
        this.diseaseRes = prescriptionRes.diseaseDesc
        this.fromDate = moment(new Date(prescriptionRes.fromDate)).format('DD/MM/YYYY') ==
          'Invalid date'
          ? ''
          : moment(new Date(prescriptionRes.fromDate)).format('DD/MM/YYYY'); prescriptionRes.fromDate;
        this.toDate = moment(new Date(prescriptionRes.toDate)).format('DD/MM/YYYY') ==
          'Invalid date'
          ? ''
          : moment(new Date(prescriptionRes.toDate)).format('DD/MM/YYYY');
        this.dataEntryEndDate = moment(new Date(prescriptionRes.dataEntryEndDate)).format('DD/MM/YYYY') ==
          'Invalid date'
          ? ''
          : moment(new Date(prescriptionRes.dataEntryEndDate)).format('DD/MM/YYYY');


        this.newStringstateName = prescriptionRes.stateName;
        this.newStringDiseaseName = prescriptionRes.diseaseDesc;
        this.newStringDiseaseCd = prescriptionRes.diseaseCd

        this.newStringRemarks = prescriptionRes.remarks;

      }
      this.itemForm.patchValue({
        selectedState: viewRes[0].stateCd,
        roundSD: this.fromDate,
        roundEndDate: this.toDate,
        roundRD: this.dataEntryEndDate,
        roundNo: this.prescriptionRes,
        diseaseCd: this.newStringDiseaseCd,



      })

    },
      (err) => {
        this.isLoadingSpinner = false;
      });

  }
  get today() {
    return moment(sessionStorage.getItem('serverCurrentDateTime')).format('YYYY-MM-DD');
  }

  selectAllForDropdownItems(items: any[]) {
    let allSelect = items => {
      items.forEach(element => {
        element['selectedAllGroup'] = 'selectedAllGroup';
      });
    };

    allSelect(items);
  }

  fromDateChange(event) {
    this.selectedStartDate = event;
    this.roundMinEndDate = this.selectedStartDate;
    this.roundMinEntryEndDate = this.selectedStartDate;
  }
  editroundSubmit() {
    if (this.itemForm.invalid || this.isShowError) {
      this.itemForm.markAllAsTouched();
      return;
    }
    let request = this.itemForm.value;
    const formattedStartDate = moment(this.itemForm.value.roundSD).format("YYYY-MM-DD") == 'Invalid date' ? '' : moment(this.itemForm.value.roundSD).format("YYYY-MM-DD");
    const formattedroundEndDate = moment(this.itemForm.value.roundEndDate).format("YYYY-MM-DD") == 'Invalid date' ? '' : moment(this.itemForm.value.roundEndDate).format("YYYY-MM-DD");
    const formattedEntryEndDate = moment(this.itemForm.value.roundRD).format("YYYY-MM-DD") == 'Invalid date' ? '' : moment(this.itemForm.value.roundRD).format("YYYY-MM-DD");

    request['fromDate'] = formattedStartDate;
    request['toDate'] = formattedroundEndDate;
    request['dataEntryEndDate'] = formattedEntryEndDate;
    request['stateCd'] = request.selectedState.map(a => a.stateCd);
    delete request.selectedState;
    delete request.roundEndDate;

    this.isLoadingSpinner = true;
    this.roundService.editRound(request).subscribe((res) => {
      this.SubmitReport = res;
      this.Successmessage = res.msg.msgDesc;
      this.isLoadingSpinner = false;
      this.openCampaignDialog();
    },
      err => this.isLoadingSpinner = false);
  }

  openCampaignDialog() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: true,
      data: {
        title: this.translateService.instant('common.info_label'),
        message: this.Successmessage,
        primaryBtnText: this.translateService.instant('common.ok_string'),
        errorFlag: true,
        icon: "assets/images/info.svg",
      },
      panelClass: 'common-info-dialog',
      width: '500px',
    });
    dialogRef.afterClosed().subscribe((res) => {
      window.location.reload()
    });
  }

}
