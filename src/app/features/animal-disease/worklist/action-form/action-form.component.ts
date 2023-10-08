import { SeekClarificationDialogComponent } from './../seek-clarification-dialog/seek-clarification-dialog.component';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SubmitDialogComponent } from '../submit-dialog/submit-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { WorkListService } from '../worklist.service';
import { catchError } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { ViewActionForm } from '../models/viewActionForm.model';
import moment from 'moment';
import { ApproveFIR, RejectFIR } from '../models/approveFir.model';
import { AnimalData } from '../../../animal-health/animal-treatment/animal-treatment.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { HealthService } from '../../../animal-health/health.service';
import { TreatmentResponseDialogComponent } from '../../../animal-health/treatment-response-dialog/treatment-response-dialog.component';
import { UpdateLabSampleComponent } from 'src/app/features/animal-health/disease-testing/update-lab-sample/update-lab-sample.component';
import { DiseaseTestingService } from 'src/app/features/animal-health/disease-testing/disease-testing.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PreviousDiseaseTestModel } from 'src/app/features/animal-health/disease-testing/previous-testing-results/previous-testing-results.component';
import { ReportDialogComponent } from 'src/app/features/animal-health/disease-testing/report-dialog/report-dialog.component';
import { ConfirmationDeleteDialogComponent } from 'src/app/shared/confirmation-delete-dialog/confirmation-delete-dialog.component';

@Component({
  selector: 'app-action-form',
  templateUrl: './action-form.component.html',
  styleUrls: ['./action-form.component.css'],
})
export class ActionFormComponent implements OnInit {
  outbreakId: ApproveFIR[] = [];
  Successmessage: ApproveFIR[] = [];
  rejectReport: RejectFIR[] = [];
  rejectmessage: RejectFIR[] = [];
  isLoadingSpinner = false;
  imageFlag = false;
  animalTagId: string;
  animal: AnimalData;
  approveFlag = false;
  sampleCollectionTable = new MatTableDataSource<ViewActionForm>();
  affectedCollectionTable = new MatTableDataSource<ViewActionForm>();
  displaySampleColumns: string[] = [
    'tag_id',
    'sample_id',
    'sample_type',
    'examination_type',
    'subExamination_type',
    'action',
  ];
  displayAffectedColumns: string[] = [
    'affected_species',
    'animals_affected',
    'animals_died',
  ];
  sub: any;
  firId: number;
  totalFirId: ViewActionForm[] = [];
  remarks: ViewActionForm[] = [];
  sourceofInfection: ViewActionForm[] = [];
  actionTaken: ViewActionForm[] = [];
  actionTakenDesc: ViewActionForm[] = [];
  villageCdData: ViewActionForm[] = [];
  sampleDetails: ViewActionForm[] = [];
  firstIncidenceDateDisplay: string;
  firstIncidenceReportingDisplay: string;
  villageDetails: ViewActionForm[] = [];
  symtomsDetails: ViewActionForm[] = [];
  diseaseDetails: ViewActionForm[] = [];
  imageFlagData: any;
  speciesImpacted: ViewActionForm[] = [];
  diseaseSuspected: ViewActionForm[] = [];
  labConfirmed: ViewActionForm[] = [];
  vaccinationDone: ViewActionForm[] = [];
  publicHealthDisease: ViewActionForm[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  animalID: any;
  constructor(
    private location: Location,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private worlistService: WorkListService,

    private diseaseService: DiseaseTestingService,
    private healthService: HealthService,
    @Inject(MAT_DIALOG_DATA) public data: { firId: number; status: string }
  ) { }

  ngOnInit(): void {
    if (this.data.status == 'Approved' || this.data.status == 'Rejected') {
      this.approveFlag = false;
    } else {
      this.approveFlag = true;
      this.isLoadingSpinner = true;
    }
    const todo$ = this.worlistService
      .viewActionForm(this.data.firId)
      .pipe(catchError((err) => of(null)));
    this.isLoadingSpinner = true;
    forkJoin([todo$]).subscribe(
      ([actionFormRes]) => {
        this.isLoadingSpinner = false;
        this.imageFlagData = actionFormRes?.imgFlag;
        if ((this.imageFlagData = 'false')) {
          this.imageFlag = false;
        } else {
          this.imageFlag = true;
        }
        this.diseaseSuspected =
          actionFormRes?.firDetailsResponseDto.diseaseSuspected;
        this.labConfirmed = actionFormRes?.firDetailsResponseDto.labConfirmed;
        this.vaccinationDone =
          actionFormRes?.firDetailsResponseDto.vaccinationDone;
        this.publicHealthDisease =
          actionFormRes?.firDetailsResponseDto.publicHealthDisease;
          this.remarks = actionFormRes?.firDetailsResponseDto.remarks;
        this.totalFirId = actionFormRes?.firDetailsResponseDto.firId;
        this.sourceofInfection =
          actionFormRes?.firDetailsResponseDto.sourceOfInfectionDesc;
        this.actionTaken = actionFormRes['actionTaken'];
        this.actionTakenDesc = actionFormRes['actionTaken'].map(
          (a) => a.actionTakenDesc
        );
        this.firstIncidenceDateDisplay = this.formatDate(
          actionFormRes.firstIncidenceDate
        );
        this.firstIncidenceReportingDisplay = this.formatDate(
          actionFormRes.firstIncidenceReportingDate
        );
        //  Village Data
        this.villageCdData = actionFormRes.firAreaMappingDetailsDesc;
        let array = actionFormRes.firAreaMappingDetailsDesc;
        const ids = array.map((obj) => obj.villageName)?.join(',');
        this.villageDetails = ids;
        //  Symtoms Data
        let arraySymtoms = actionFormRes.firSymptomDetailsDesc;
        const idsSymtoms = arraySymtoms
          .map((obj) => obj.symptomDesc)
          ?.join(',');
        this.symtomsDetails = idsSymtoms;
        //  Diseases Data
        let arrayDiseases = actionFormRes.firDiseaseDetailsDesc;
        const idsDiseases = arrayDiseases
          .map((obj) => obj.diseaseDesc)
          ?.join(',');
        this.diseaseDetails = idsDiseases;

        // Affected Animals Details
        this.speciesImpacted = actionFormRes['firSpeciesImpacted'];
        this.affectedCollectionTable.data = this.speciesImpacted ?? [];

        // Sample Details
        this.sampleDetails =
          actionFormRes.sampleDetails['labTestingDetails'] ?? [];

        for (let data of this.sampleDetails) {
          data['tagId'] = data.sampleExaminationDetails.map((a) => a.tagId);
          data['sampleExaminationTypeCdDesc'] =
            data.sampleExaminationDetails.map(
              (a) => a.sampleExaminationTypeCdDesc
            );
          data['sampleExaminationSubtypeCdDesc'] =
            data.sampleExaminationDetails.map(
              (a) => a.sampleExaminationSubtypeCdDesc
            );
        }
        this.sampleCollectionTable.data = this.sampleDetails ?? [];
       
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }
  formatDate(date: string) {
    return moment(date).format('DD/MM/YYYY');
  }

  goBack() {
    this.location.back();
  }

  approveSubmit() {
    this.isLoadingSpinner = true;

    const result = {
      actionTakenCdList: this.actionTaken.map((a) => a.actionTakenCd),
      firId: this.totalFirId,
      updateAffectedSpecies: this.speciesImpacted,
      villageCdList: this.villageCdData.map((a) => a.villageCd),
    };
    this.dialog
      .open(ConfirmationDeleteDialogComponent, {
        data: {
          id: '',
          title: 'Alert',
          message: 'Are you sure you want to approve?',
          icon: 'assets/images/alert.svg',
          primaryBtnText: 'Yes',
          secondaryBtnText: 'No',
        },
        panelClass: 'common-alert-dialog',
      })
      .afterClosed()
      .subscribe({
        next: (response) => {
          if (response) {
            this.worlistService.approveFir(result).subscribe((res) => {
              this.outbreakId = res.data.outbreakId;
              this.Successmessage = res.msg.msgDesc;
              this.isLoadingSpinner = false;
              this.openDialogwithCampaign();
            });
          }
        },
      });
    this.isLoadingSpinner = false;
  }
  openDialogwithCampaign() {
    const dialogRef = this.dialog.open(SubmitDialogComponent, {
      disableClose: true,
      data: {
        title: this.Successmessage,
        outbreakId: this.outbreakId,
      },
      width: '500px',
    });
    dialogRef.afterClosed().subscribe((res) => { });
  }

  rejectSubmit() {
    this.isLoadingSpinner = true;
    this.dialog
      .open(ConfirmationDeleteDialogComponent, {
        data: {
          id: '',
          title: 'Alert',
          message: 'Are you sure you want to reject?',
          icon: 'assets/images/alert.svg',
          primaryBtnText: 'Yes',
          secondaryBtnText: 'No',
        },
        panelClass: 'common-alert-dialog',
      })
      .afterClosed()
      .subscribe({
        next: (response) => {
          if (response) {
            this.worlistService.rejectFir(this.totalFirId).subscribe((res) => {
              this.rejectReport = res;
              this.rejectmessage = res.message;
              this.isLoadingSpinner = false;
              this.openDialogRejectCampaign();
            });
          }
        },
      });
    this.isLoadingSpinner = false;
  }

  openDialogRejectCampaign() {
    const dialogRef = this.dialog.open(SeekClarificationDialogComponent, {
      disableClose: true,
      data: {
        title: this.rejectmessage,
      },
      width: '500px',
    });
    dialogRef.afterClosed().subscribe((res) => { });
  }

  updateLab(element, flag) {
    this.animalID = element.sampleExaminationDetails[0].animalId;
    if (flag == 1) {
      const dialogRef = this.dialog.open(UpdateLabSampleComponent, {
        position: {
          right: '0px',
          top: '0px',
        },
        data: {
          animalTagId: this.animalID,
          data: [element],
          viewFlag: false,
        },
        width: '600px',
        height: '100vh',
        panelClass: 'custom-dialog-container',
      });
      dialogRef.afterClosed().subscribe((res: boolean) => {
        if (!res) {
          return;
        }
        this.dialog.open(TreatmentResponseDialogComponent, {
          data: {
            title: 'Info',
            icon: 'assets/images/info.svg',
            message: 'Lab results saved successfully',
            primaryBtnText: 'OK',
            secondaryBtnText: '',
          },
          panelClass: 'common-info-dialog',
        });
        //this.getCurrentRoute();
        this.getPreviousResults();
      });
    } else {
      const dialogRef = this.dialog.open(UpdateLabSampleComponent, {
        position: {
          right: '0px',
          top: '0px',
        },
        data: {
          animalTagId: this.animalID,
          data: [element],
          viewFlag: true,
        },
        width: '600px',
        height: '100vh',
        panelClass: 'custom-dialog-container',
      });
      dialogRef.afterClosed().subscribe((res: boolean) => {
        if (!res) {
          return;
        }
        //this.getCurrentRoute();
        //this.getPreviousResults(this.animal.tagId);
      });
    }
  }

  getPreviousResults() {
    this.isLoadingSpinner = true;
    this.sampleCollectionTable.data = [];
    this.worlistService
      .viewActionForm(this.data.firId).subscribe(
      (actionFormRes: any) => {
        
        this.imageFlagData = actionFormRes?.imgFlag;
        if ((this.imageFlagData = 'false')) {
          this.imageFlag = false;
        } else {
          this.imageFlag = true;
        }
        this.diseaseSuspected =
          actionFormRes?.firDetailsResponseDto.diseaseSuspected;
        this.labConfirmed = actionFormRes?.firDetailsResponseDto.labConfirmed;
        this.vaccinationDone =
          actionFormRes?.firDetailsResponseDto.vaccinationDone;
        this.publicHealthDisease =
          actionFormRes?.firDetailsResponseDto.publicHealthDisease;
          this.remarks = actionFormRes?.firDetailsResponseDto.remarks;
        this.totalFirId = actionFormRes?.firDetailsResponseDto.firId;
        this.sourceofInfection =
          actionFormRes?.firDetailsResponseDto.sourceOfInfectionDesc;
        this.actionTaken = actionFormRes['actionTaken'];
        this.actionTakenDesc = actionFormRes['actionTaken'].map(
          (a) => a.actionTakenDesc
        );
        this.firstIncidenceDateDisplay = this.formatDate(
          actionFormRes.firstIncidenceDate
        );
        this.firstIncidenceReportingDisplay = this.formatDate(
          actionFormRes.firstIncidenceReportingDate
        );
        //  Village Data
        this.villageCdData = actionFormRes.firAreaMappingDetailsDesc;
        let array = actionFormRes.firAreaMappingDetailsDesc;
        const ids = array.map((obj) => obj.villageName)?.join(',');
        this.villageDetails = ids;
        //  Symtoms Data
        let arraySymtoms = actionFormRes.firSymptomDetailsDesc;
        const idsSymtoms = arraySymtoms
          .map((obj) => obj.symptomDesc)
          ?.join(',');
        this.symtomsDetails = idsSymtoms;
        //  Diseases Data
        let arrayDiseases = actionFormRes.firDiseaseDetailsDesc;
        const idsDiseases = arrayDiseases
          .map((obj) => obj.diseaseDesc)
          ?.join(',');
        this.diseaseDetails = idsDiseases;

        // Affected Animals Details
        this.speciesImpacted = actionFormRes['firSpeciesImpacted'];
        this.affectedCollectionTable.data = this.speciesImpacted ?? [];

        // Sample Details
        this.sampleDetails =
          actionFormRes.sampleDetails['labTestingDetails'] ?? [];

        for (let data of this.sampleDetails) {
          data['tagId'] = data.sampleExaminationDetails.map((a) => a.tagId);
          data['sampleExaminationTypeCdDesc'] =
            data.sampleExaminationDetails.map(
              (a) => a.sampleExaminationTypeCdDesc
            );
          data['sampleExaminationSubtypeCdDesc'] =
            data.sampleExaminationDetails.map(
              (a) => a.sampleExaminationSubtypeCdDesc
            );
        }
        this.sampleCollectionTable.data = this.sampleDetails ?? [];
        this.isLoadingSpinner = false;
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  isLabPending(element) {
    return element.sampleExaminationDetails.some(
      (sample) => sample.samplingStatus == 1
    );
  }

  manageDiagnostics(selectedCase: PreviousDiseaseTestModel) {
    switch (selectedCase.samplingStatus) {
      case 1:
        this.updateResult(selectedCase);
        break;
      case 2:
        this.viewReport(selectedCase);
        break;
    }
  }
  updateResult(list: any) {
    this.isLoadingSpinner = true;
    this.isLoadingSpinner = false;
    const dialogRef = this.dialog.open(ReportDialogComponent, {
      position: {
        right: '0px',
        top: '0px',
      },
      data: {
        animalTagId: this.animalID,
        data: list,
      },
      width: '600px',
      height: '100vh',
      panelClass: 'custom-dialog-container',
    });
    dialogRef.afterClosed().subscribe((res: boolean) => {
      if (!res) {
        return;
      }
      this.dialog.open(TreatmentResponseDialogComponent, {
        data: {
          title: 'Info',
          icon: 'assets/images/info.svg',
          message: 'Diagnostics results saved successfully',
          primaryBtnText: 'OK',
          secondaryBtnText: '',
        },
        panelClass: 'common-info-dialog',
      });
      //this.getCurrentRoute();
      this.getPreviousResults();
    });
  }

  viewReport(selectedCase: PreviousDiseaseTestModel) { }
}
