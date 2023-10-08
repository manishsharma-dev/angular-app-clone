import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AdditionInfo,
  AnimalHistory,
  HistoryDetail,
} from 'src/app/shared/shareService/model/owner.detail';
import { OwnerServiceService } from 'src/app/shared/shareService/owner-detail-service/owner-service.service';
import { ShareDataService } from 'src/app/shared/shareService/owner-detail-service/share-data.service';
import { EtService } from '../et/et.service';
import { Location } from '@angular/common';
import { CalvingStatusDialogComponent } from '../calving/calving-status-dialog/calving-status-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { StatusDialogComponent } from '../artificial-insemination/status-dialog/status-dialog.component';
import { ModifyAnimalDetailsComponent } from '../modify-animal-details/modify-animal-details.component';
import { MasterConfig } from 'src/app/shared/master.config';
import { ConfirmationDeleteDialogComponent } from 'src/app/shared/confirmation-delete-dialog/confirmation-delete-dialog.component';
import { DataServiceService } from 'src/app/shared/shareService/data-service.service';
import { CalvingService } from '../calving/calving.service';
import { ArtificialInseminationService } from '../artificial-insemination/artificial-insemination.service';
import { PregnancyDiagnosisService } from '../pregnancy-diagnosis/pregnancy-diagnosis.service';
import { animalBreedingPRConfig } from 'src/app/shared/animal-breeding-pr.config';
import { TranslatePipe } from '@ngx-translate/core';
import { PrService } from '../../performance-recording/pr.service';
import moment from 'moment';

interface HistoryDetailInput {
  compDetail?: string;
  newPageUrl?: string;
  tagId?: number;
  isHistory?: boolean;
  isBreed?: boolean;
  name?: string;
  columns?: string[];
}

@Component({
  selector: 'app-breeding-history',
  templateUrl: './breeding-history.component.html',
  styleUrls: ['./breeding-history.component.css'],
  providers: [TranslatePipe],
})
export class BreedingHistoryComponent implements OnInit {
  @Input() historyDetail: HistoryDetailInput;
  @Output() getBreedingDetails = new EventEmitter();
  @Output() ownerDetail = new EventEmitter();
  masterConfig = MasterConfig;
  animalHistoryDetail: any;
  dataSource = new MatTableDataSource<AnimalHistory>();
  isLoadingSpinner: boolean = false;
  columnsToDisplay: string[] = [
    'aiLactationNumber',
    'aiDate',
    'bullId',
    'pdDate',
    'calvingDate',
    'aiType',
    'serviceType',
    'status',
    'actualAiNumber',
    'aiDoneBy'
  ];
  tagId: number;
  gestationDays: number 
  heatType: Array<{}>;
  daysAfterET: number = 0;
  animalData: any = [];
  eligibleForEt: string;
  latestBreeding: any;
  minAgeofAnimal: number;
  userInformation:any
  constructor(
    private commonService: OwnerServiceService,
    private shareDataService: ShareDataService,
    private route: ActivatedRoute,
    private router: Router,
    private etService: EtService,
    private location: Location,
    public dialog: MatDialog,
    private dataService: DataServiceService,
    private calvingService: CalvingService,
    private aiService: ArtificialInseminationService,
    private pdService: PregnancyDiagnosisService,
    private prService: PrService,
    private translatePipe: TranslatePipe,
  ) {}

  ngOnInit(): void {
  
    this.getAnimalHistoryDetail(this.historyDetail?.tagId);
    if (this.historyDetail?.columns) {
      this.columnsToDisplay = this.historyDetail.columns;
    }
    this.shareDataService.getData().subscribe((data) => {
      if (data?.tagId) {
        this.getAnimalHistoryDetail(data?.tagId);
      }
    });
    if (this.historyDetail['compDetail'] == 'HT') this.getHeatType();
    this.eligibleForEt = this.route.snapshot.queryParams['eligibleForEt'];
   
    if (this.historyDetail['compDetail'] === 'Calving'){
      this.getMinAge(animalBreedingPRConfig.minAgeForCalvings);
      if(this.historyDetail['isHistory']){
      const currentDate = moment().format('YYYY-MM-DD') 
      this.gestationCalculation(currentDate)
      }else{
        this.detectGestationInfo();
      }
    }
      
    else this.getMinAge(animalBreedingPRConfig.MinAgeInmonths);

    if (this.historyDetail['compDetail'] == 'AI' ||
    this.historyDetail['compDetail'] == 'PD'
  ||this.historyDetail['compDetail'] == 'Calving') {
   const secondToLast = this.columnsToDisplay.length - 1;
   this.columnsToDisplay.splice(secondToLast, 0, 'semenType');
 }

   
  }
  getAnimalHistoryDetail(id: any,route?:boolean): void {
    this.isLoadingSpinner = true;
    this.animalHistoryDetail = [];
    if (this.historyDetail?.compDetail === 'GA') {
      this.prService
        .getGeneticHistory(this.historyDetail.tagId.toString())
        .subscribe(
          (data) => {
            this.animalHistoryDetail = data;
            const breedingDetail =
              this.animalHistoryDetail?.animalGeneticResponseList;
            this.latestBreeding =
              breedingDetail?.length > 0
                ? this.historyDetail['isHistory']
                  ? breedingDetail
                  : breedingDetail.splice(0, 1)
                : [];
            // this.gestationDays = this.latestBreeding[0]?.gestationDays;
            this.daysAfterET = this.latestBreeding[0]?.daysAfterAI;
            this.dataSource = new MatTableDataSource(this.latestBreeding);
            const breedInformation = {
              latestBreeding: this.latestBreeding,
              species: this.animalHistoryDetail?.animalResponse?.species,
            };
            this.getBreedingDetails.emit(breedInformation);
            this.ownerDetail.emit({
              villageCd:
                this.animalHistoryDetail?.animalResponse
                  ?.ownerAddressCityVillageCd,
              animalResponse: this.animalHistoryDetail?.animalResponse,
            });
            this.isLoadingSpinner = false;
           
          },
          () => (this.isLoadingSpinner = false)
        );
    } else {
      this.commonService.getAnimalHistory(id).subscribe(
        (data: HistoryDetail[]) => {
          this.animalHistoryDetail = data;
          const breedingDetail = this.animalHistoryDetail?.breedingHistoryList;
          this.latestBreeding =
            breedingDetail?.length > 0
              ? this.historyDetail['isHistory']
                ? breedingDetail
                : breedingDetail.splice(0, 1)
              : [];
          // this.gestationDays = this.latestBreeding[0]?.gestationDays;
          this.daysAfterET = this.latestBreeding[0]?.daysAfterAI;
          this.dataSource = new MatTableDataSource(this.latestBreeding);
          const breedInformation = {
            latestBreeding: this.latestBreeding,
            species:
              this.animalHistoryDetail?.ownerResponse?.animalsList[0]?.species,
          };
          this.getBreedingDetails.emit(breedInformation);
          this.ownerDetail.emit({
            villageCd:
              this.animalHistoryDetail?.ownerResponse
                ?.ownerAddressCityVillageCd,
            animalResponse:
              this.animalHistoryDetail?.ownerResponse?.animalsList[0],
          });
          this.isLoadingSpinner = false;
          if(route) this.addNewPage()
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
    }
  }
  redirectionCheck(): void {
    this.router.navigate(['/not-found']);
  }
  addNewPage(): void {
    if (
      this.historyDetail['compDetail'] === 'GA' &&
      this.animalHistoryDetail?.animalResponse?.animalStatusCd !== 1
    ) {
      this.confirmtionDialoug(
        'animalTreatmentSurgery.animal_is_not_active',
        'Ok'
      );
      return;
    }
    this.animalData =
      this.animalHistoryDetail &&
      this.animalHistoryDetail?.ownerResponse &&
      this.animalHistoryDetail?.ownerResponse?.animalsList?.length > 0
        ? this.animalHistoryDetail?.ownerResponse?.animalsList
        : [];
        if (this.animalData[0]?.animalStatusCd != 1) {
          this.confirmtionDialoug('errorMsg.animal_not_active', 'Ok');
        }
    else if (this.historyDetail['compDetail'] == 'ET' && this.eligibleForEt == 'N') {
      this.confirmtionDialoug('errorMsg.not_eligible_for_et', 'Ok');
    } else if (
      this.animalData[0]?.ageInMonths < this.minAgeofAnimal ||
      this.animalData[0]?.ageInDays ||
      !this.animalData[0]?.ageInMonths
      )
     {
      const mesg =
        this.translatePipe.transform('errorMsg.animal_age_less') +
        this.minAgeofAnimal +
        ' ' +
        this.translatePipe.transform('animalBreeding.months_age');
      this.confirmtionDialoug(mesg, 'Ok');
     }
    else {
      if (this.historyDetail['isBreed']) {
        if (
          this.userInformation?.aiCenterName.length === 0 &&
          this.historyDetail['compDetail'] == 'AI'
        )
          this.confirmtionDialoug(`errorMsg.no_ai_center`, 'Ok');
          else this.CheckBreedingHistory();
      }
      else this.navigateByURL(false);
    }
  }
  goBack() {
    this.location.back();
  }

  private CheckBreedingHistory(): void {
    const lactNo = this.animalData[0]?.currentLactationNo >= 0 ? false : true;
    const breedingDetail = this.animalHistoryDetail?.breedingHistoryList;
    const latestBreeding =
      breedingDetail?.length > 0 ? breedingDetail[0] : null;
    // breedingDetail.splice(breedingDetail?.length - 1, 1)
    this.isLoadingSpinner = false;
    const lastBreedingDate =
      latestBreeding && latestBreeding?.lastBreedingDate
        ? moment(latestBreeding?.lastBreedingDate)
        : null;
   const totalMonthForBreed = moment().diff(lastBreedingDate, 'months');
    if (
      (this.animalData[0]?.milkingStatus !== 'NA' && lactNo) ||
      !this.animalData[0]?.pregnancyStatus ||
      !this.animalData[0]?.breed ||
      !this.animalData[0]?.milkingStatus
    ) {
      this.addAnimalAdditionalDetails();
    } else {
      if (
        totalMonthForBreed &&
        totalMonthForBreed >= 24 &&
        this.animalData[0]?.milkingStatus !== 'NA'
      ) {
        const dialogInfo = {
          title: 'errorMsg.last_two_year_breeding_activity',
          animal_id: this.animalData[0]?.animalId,
          isBreedingActivity: true,
          tagId: this.animalData[0]?.tagId,
          lactationNo: this.animalData[0]?.currentLactationNo,
          animalAge: this.animalData[0]?.ageInMonths,
          moduleType: this.historyDetail['compDetail'],
        };

        this.pregnancyStatusDialog(dialogInfo);
      } else if (
        this.animalData[0]?.pregnancyStatus == 'Y' &&
        (this.historyDetail['compDetail'] == 'AI' ||
          this.historyDetail['compDetail'] == 'ET')
      ) {
        const dialogInfo = {
          title: 'errorMsg.animal_marked_preg',
          animal_id: this.animalData[0]?.animalId,
          isBreedingActivity: false,
          tagId: this.animalData[0]?.tagId,
          lactationNo: this.animalData[0]?.currentLactationNo,
          animalAge: this.animalData[0]?.ageInMonths,
          moduleType: this.historyDetail['compDetail'],
        };
        this.pregnancyStatusDialog(dialogInfo);
      } else if (
        this.historyDetail['compDetail'] == 'Calving' &&
        this.animalData[0]?.pregnancyStatus != 'Y'
      )
        this.confirmtionDialoug(
          `animalBreeding.commonLabel.animal_not_preg`,
          'Ok'
        );
      else if (
        this.historyDetail['compDetail'] == 'Calving' &&
        this.animalData[0]?.milkingStatus == 'In Milk'
      )
        this.changeMilkingStatus();
      else this.navigateByURL(false);
    }
  }

  addAnimalAdditionalDetails(isView?: boolean) {
    if (this.animalData && this.animalData[0]) {
      const dialogRef = this.dialog.open(ModifyAnimalDetailsComponent, {
        data: {
          animalData: this.animalData[0],
        },
        width: '500px',
        height: '100vh',
        panelClass: 'custom-dialog-container',
        position: {
          right: '0px',
          top: '0px',
        },
      });
      dialogRef.afterClosed().subscribe((res) => {
        if (res) {
          this.getAnimalHistoryDetail(this.animalData[0]?.tagId,true)
        };
      });
    } else {
      this.confirmtionDialoug(`errorMsg.select_tag_first`, 'Ok');
    }
  }

  private changeMilkingStatus() {
    this.dialog
      .open(CalvingStatusDialogComponent, {
        data: {
          title: 'animalBreeding.commonLabel.animal_in_milk_status',
          animal_id: this.animalData[0]?.animalId,
        },
        width: '620px',
        panelClass: 'makeItMiddle',
      })
      .afterClosed()
      .subscribe((data) => {
        if (data && data?.data == 3) this.navigateByURL(false);
        else if (data) this.getAnimalHistoryDetail(this.animalData[0].tagId);
      });
  }

  private pregnancyStatusDialog(data: AdditionInfo): void {
    this.dialog
      .open(StatusDialogComponent, {
        data: data,
        width: '500px',
        panelClass: 'makeItMiddle',
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.historyDetail['newPageUrl'] = res?.isCalving
            ? this.historyDetail['calvingPageUrl']
            : this.historyDetail['newPageUrl'];
          this.navigateByURL(false);
        }
      });
  }
  navigateByURL(isEdit?: boolean) {
    const param = {
      isEdit: isEdit,
      tagId: this.historyDetail?.tagId,
    };
    if (this.historyDetail['compDetail'] === 'GA') {
      delete param.tagId;
      param['animalId'] = this.animalHistoryDetail?.animalResponse?.animalId;
    }
    if (!isEdit) delete param['isEdit'];
    this.router.navigate([this.historyDetail['newPageUrl']], {
      queryParams: param,
    });
  }
  private getHeatType(): void {
    this.isLoadingSpinner = true;
    this.etService.getHeatType(this.historyDetail?.tagId).subscribe(
      (data: any) => {
        this.isLoadingSpinner = false;
        this.heatType = data;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  private confirmtionDialoug(message: string, button: string): void {
    this.dialog
      .open(ConfirmationDeleteDialogComponent, {
        data: {
          id: '',
          title: 'common.alert',
          message: message,
          icon: 'assets/images/alert.svg',
          primaryBtnText: 'common.ok',
        },
        panelClass: 'common-alert-dialog',
      })
      .afterClosed();
  }
  private detectGestationInfo(): void {
    this.dataService.gestationDayInfo.subscribe((calving_date: string) => {
      this.gestationCalculation(calving_date)
      
    });
  }
  editDetection(type: string) {
    this.isLoadingSpinner = true;
    const fetchAnimalDetails =
      type == 'AI'
        ? this.aiService.getAIDetailsByID(this.historyDetail?.tagId)
        : type == 'PD'
        ? this.pdService.getPDDetailsByID(this.historyDetail?.tagId)
        : this.calvingService.getCalvingDetailsByID(this.historyDetail?.tagId);
    fetchAnimalDetails.subscribe(
      (data) => {
        this.isLoadingSpinner = false;
        this.navigateByURL(true);
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }
  private getMinAge(age_type: string): void {
    this.dataService.getDefaultConfig(age_type).subscribe((data: any) => {
      this.minAgeofAnimal = parseInt(data?.defaultValue);
    });
  }
  private loggedUserInfo(): void {
    this.dataService._getUserDetailsByUserId().subscribe((data) => {
      this.userInformation = data;
    });
    
    
  }
  gestationCalculation(calving_date):void{
    if (calving_date) {
      this.calvingService
        .getGestationDays(this.historyDetail?.tagId, calving_date)
        .subscribe((data: number) => {
          if (data >= 0) {
            this.gestationDays = data;
            const breedInformation = {
              latestBreeding: this.latestBreeding,
              species:
                this.animalHistoryDetail?.ownerResponse?.animalsList[0]
                  ?.species,
              gestationDays: this.gestationDays,
            };
            this.getBreedingDetails.emit(breedInformation);
          }
        });
      }
    }
}
