import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AnimalHealthConfig } from 'src/app/shared/animal-health.config';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { AlphaNumericSpecialValidation, NumericValidation } from 'src/app/shared/utility/validation';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { CampaignCreationService } from '../campaign-creation/campaign-creation.service';
import { IntimationReportService } from '../intimation-report/intimation-report.service';
import { Village } from '../intimation-report/models/village.model';
import { VaccinationFor } from '../vaccination/models/vacc-For.model';
import { VaccinationService } from '../vaccination/vaccination.service';
import { EditRoundMasterComponent } from './edit-round-master/edit-round-master.component';
import { RoundList } from './models/roundList.model';
import { RoundMasterService } from './round-master.service';
import { SaveRoundMaster } from './models/saveRoundMaster.model';
import { CaseIDDialogComponent } from '../first-aid/case-id-dialog/case-id-dialog.component';
import { ViewRoundMasterComponent } from './view-round-master/view-round-master.component';
import { RoundDialogComponent } from './round-dialog/round-dialog.component';

@Component({
  selector: 'app-round-master',
  templateUrl: './round-master.component.html',
  styleUrls: ['./round-master.component.css']
})
export class RoundMasterComponent implements OnInit {
  validationMsgRe = animalHealthValidations.firstAid;
  isLoadingSpinner: boolean = false;
  itemForm: FormGroup;
  tabDetails: boolean = true;
  compaignForm: boolean = false;
  displayedColumns: string[] = DISPLAYED_COLUMNS;
  public isShowError: string = '';
  validationMsg = animalHealthValidations.round;
  dataSource = new MatTableDataSource();
  campMinEndDate: string;
  campMaxEndDate: string;
  campMinStartDate: string;
  campMaxStartDate: Date;
  campMinEntryEndDate: string;
  selectedStartDate: string;
  selectedEndDate: string;
  projectTypeData: any;
  getVaccinationFor: VaccinationFor[] = [];
  state: Village[] = [];
  temStateList: Village[];
  roundSubmitted = false;
  filterSelectObj = [];
  getRoundList: RoundList[] = [];
  startDateDisplay: string;
  endDateDisplay: string;
  Successmessage: SaveRoundMaster[] = [];
  roundIdMessage: SaveRoundMaster[] = [];
  private withpaginator!: MatPaginator;
  private sort!: MatSort;
  constructor(
    private camCreationService: CampaignCreationService,
    private intimationReportService: IntimationReportService,
    private vaccinationService: VaccinationService,
    private roundService: RoundMasterService,
    public formBuilder: FormBuilder,
    public dialog: MatDialog,
    private readonly translateService: TranslateService,
  ) { }

  @ViewChild('withpaginatorRef') set matPaginator(mp: MatPaginator) {
    this.withpaginator = mp;
    this.setDataSourceAttributes();
  }

  ngOnInit(): void {
    this.itemForm = this.formBuilder.group({
      selectedstate: [[], [Validators.required]],
      diseaseCd: ['', Validators.required],
      // projectId: ['', [Validators.required]],
      roundStartDate: [[], [Validators.required]],
      roundEndDate: [[], [Validators.required]],
      roundEntryEndDate: [[], [Validators.required]],
      recordDate: [
        { value: moment(this.today).format('DD/MM/YYYY'), disabled: true },
        [Validators.required],
      ],
      roundNumber: [[], [Validators.required, Validators.maxLength(2), NumericValidation]],
      treatmentRemarks: [
        '',
        [
          Validators.required,
          Validators.maxLength(250),
          AlphaNumericSpecialValidation,
        ],
      ],

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
    const projectReport = this.camCreationService.projectType(AnimalHealthConfig.campaignUserID.toString()).pipe(catchError((err) => of(null)));
    const diseaseReport = this.vaccinationService.getVaccinationFor().pipe(catchError((err) => of(null)));
    const roundList = this.roundService.roundList('request').pipe(catchError((err) => of(null)));
    this.isLoadingSpinner = true;
    forkJoin([projectReport, diseaseReport, roundList]).subscribe(([projectRes, diseaseRes, roundRes]) => {
      this.projectTypeData = projectRes?.userProjectAllocation ?? [];
      this.getVaccinationFor = diseaseRes;


      for (let data of roundRes) {
        data['formattedFromDate'] = moment(new Date(data.fromDate)).format('DD/MM/YYYY') ==
          'Invalid date'
          ? ''
          : moment(new Date(data.fromDate)).format('DD/MM/YYYY');
          data['formattedEndDate'] =
          moment(new Date(data.toDate)).format('DD/MM/YYYY') ==
            'Invalid date'
            ? ''
            : moment(new Date(data.toDate)).format('DD/MM/YYYY');
      }
      this.dataSource.data = roundRes ?? [];
      this.isLoadingSpinner = false;
    },
      (err) => {
        this.isLoadingSpinner = false;
      });
    this.filterSelectObj.filter((o) => {
      o.options = this.getFilterObject(this.getRoundList, o.columnProp);
    });
  }

  getFilterObject(fullObj, key) {
    const uniqChk = [];
    fullObj.filter((obj) => {
      if (!uniqChk.includes(obj[key])) {
        uniqChk.push(obj[key]);
      }
      return obj;
    });
    return uniqChk;
  }
  selectAllForDropdownItems(items: any[]) {
    let allSelect = items => {
      items.forEach(element => {
        element['selectedAllGroup'] = 'selectedAllGroup';
      });
    };

    allSelect(items);
  }

  setDataSourceAttributes() {
    this.dataSource.paginator = this.withpaginator;
    this.dataSource.sort = this.sort;
  }

  roundEndDateChange(event) {
    this.campMaxStartDate = event;
    this.campMinEntryEndDate = event;
  }

  filterData(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

  }

  campaignCancel() {
    this.itemForm.reset();
    window.location.reload();

  }
  showTabsContent() {
    this.compaignForm = false;
    this.tabDetails = true;
  }
  get today() {
    return moment(sessionStorage.getItem('serverCurrentDateTime')).format('YYYY-MM-DD');
  }

  fromDateChange(event) {
    this.selectedStartDate = event;
    this.campMinEndDate = this.selectedStartDate;
    this.campMinEntryEndDate = this.selectedStartDate;
  }
  get f() {
    return this.itemForm.controls;
  }

  addCampaign() {
    this.compaignForm = true;
    this.tabDetails = false;
  }
  editRoundMasterDialog(element) {
    if (element.campaignStatusId == 2) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translateService.instant('common.info_label'),
          primaryBtnText: this.translateService.instant('common.ok_string'),
          errorFlag: true,
          icon: "assets/images/info.svg",
        },
        width: '500px',
        panelClass: 'common-info-dialog',
      });
    } else {
      const dialogRef = this.dialog.open(EditRoundMasterComponent, {
        width: '40%',
        height: '100vh',
        panelClass: 'custom-dialog-container',
        data: {
          element,
        },
        position: {
          right: '0px',
        },
      });
      dialogRef.afterClosed().subscribe(res => {
      });
    }
  }


  openRoundViewDialog(roundNo: number, stateCd: number, diseaseCd: number) {
    const dialogRef = this.dialog.open(ViewRoundMasterComponent, {
      width: '40%',
      height: '100vh',
      panelClass: 'custom-dialog-container',
      data: {
        roundNo,
        stateCd,
        diseaseCd
      },
      position: {
        right: '0px',

      },
    });
    dialogRef.afterClosed().subscribe(res => {
    });
  }

  roundSubmit(): void {
    if (this.itemForm.invalid || this.isShowError) {
      this.itemForm.markAllAsTouched();
      return;
    }
    const roundStartDate =
      moment(this.itemForm.value.roundStartDate).format(
        'YYYY-MM-DD'
      ) == 'Invalid date'
        ? ''
        : moment(this.itemForm.value.roundStartDate).format(
          'YYYY-MM-DD'
        );

    const roundEndDate =
      moment(this.itemForm.value.roundEndDate).format(
        'YYYY-MM-DD'
      ) == 'Invalid date'
        ? ''
        : moment(this.itemForm.value.roundEndDate).format(
          'YYYY-MM-DD'
        );
    const roundEntryEndDate =
      moment(this.itemForm.value.roundEntryEndDate).format(
        'YYYY-MM-DD'
      ) == 'Invalid date'
        ? ''
        : moment(this.itemForm.value.roundEntryEndDate).format(
          'YYYY-MM-DD'
        );

    let request = this.itemForm.value;
    (request = {
      ...this.itemForm.value,
      roundNo: request['roundNumber'],
      remarks: request['treatmentRemarks'],
      diseaseCd: request['diseaseCd'],
      stateCd: request.selectedstate.map((a) => a.stateCd),
      projectId: request['projectId'],
      fromDate: roundStartDate,
      toDate: roundEndDate,
      dataEntryEndDate: roundEntryEndDate
    });
    delete request.selectedstate;
    delete request.treatmentRemarks;
    delete request.roundNumber;
    delete request.roundEntryEndDate;
    delete request.roundEndDate;
    delete request.roundStartDate;
    delete request.projectId;

    this.isLoadingSpinner = true;
    this.roundService.saveRoundMaster(request).subscribe((res: any) => {
      this.Successmessage = res.msg.msgDesc;
      for (let data of res.data) {
        this.roundIdMessage = data.roundNo;
      }
      this.openCampaignDialog();

    }, err => this.isLoadingSpinner = false);
  }

  openCampaignDialog() {
    const dialogRef = this.dialog.open(RoundDialogComponent, {
      data: {
        title: this.Successmessage,
        roundID: this.roundIdMessage,
      },
      width: '500px',
    });
    dialogRef.afterClosed().subscribe((res) => { });
  }

}

const DISPLAYED_COLUMNS = ['sr_no', 'round_no', 'stateNames', 'diseaseName',
  'roundStartDate', 'roundEndDate', 'action'];
