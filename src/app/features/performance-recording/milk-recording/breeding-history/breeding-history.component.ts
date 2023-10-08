import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import { MasterConfig } from 'src/app/shared/master.config';
import { AnimalHistory } from 'src/app/shared/shareService/model/owner.detail';
import { ShareDataService } from 'src/app/shared/shareService/owner-detail-service/share-data.service';
import { SnackBarMessage } from 'src/app/shared/snack-bar';
import { PrService } from '../../pr.service';

interface HistoryDetail {
  compDetail: string;
  newPageUrl: string;
  tagId: string;
  isHistory: boolean;
  isBreed: boolean;
  name: string;
}
@Component({
  selector: 'app-breeding-history-mr',
  templateUrl: './breeding-history.component.html',
  styleUrls: ['./breeding-history.component.css'],
  providers: [TranslatePipe],
})
export class BreedingHistoryComponent implements OnInit {
  masterConfig = MasterConfig;
  @Input() historyDetail: HistoryDetail;
  showBreadCrumb = false;
  @Output() getBreedingDetails = new EventEmitter();
  animalHistoryDetail: any;
  dataSource = new MatTableDataSource<AnimalHistory>();
  isLoadingSpinner: boolean = false;
  columnsToDisplay: string[] = [
    'recordNo',
    'mrDate',
    'morningYield',
    'afternoonYield',
    'eveningYield',
    'totalYield',
    'daysInmilk',
  ];
  tagId: any;
  animalDetails: any;
  gestationDays: any = 0;
  heatType: any;
  isHistory: boolean = false;
  constructor(
    private prService: PrService,
    private shareDataService: ShareDataService,
    private route: ActivatedRoute,
    private router: Router,
    private _snackBar: MatSnackBar,
    private translatePipe: TranslatePipe
  ) {}

  ngOnInit(): void {
    this.isHistory = this.historyDetail ? this.historyDetail?.isHistory : true;
    this.showBreadCrumb = this.route.snapshot.data?.showBreadCrumb;
    this.tagId = this.route.snapshot.queryParams['tagId'];
    if (this.tagId) {
      this.getAnimalHistoryDetail(this.tagId);
    }
  }
  getAnimalHistoryDetail(id: any): void {
    this.isLoadingSpinner = true;
    this.animalHistoryDetail = [];

    if (this.historyDetail?.compDetail === 'GA') {
      this.prService
        .getGeneticHistory(this.historyDetail?.tagId)
        .subscribe((res) => {});
    } else
      this.prService.getAnimalHistory(id).subscribe(
        (data: any) => {
          this.animalHistoryDetail = data;
          const breedingDetail = this.animalHistoryDetail?.mrHistoryList;
          let latestBreeding =
            breedingDetail?.length > 0
              ? this.historyDetail
                ? breedingDetail.slice(0, 1)
                : breedingDetail
              : [];
          this.dataSource.data = latestBreeding.map((data) => ({
            ...data,
            mrDateParsed: this.getParsedDate(data.mrDate),
          }));
          const breedInformation = {
            latestBreeding: latestBreeding,
            species: this.animalHistoryDetail?.animalResponse?.species,
          };
          this.getBreedingDetails.emit(breedInformation);
          this.isLoadingSpinner = false;
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
  }
  redirectionCheck(): void {
    this.router.navigate(['/not-found']);
  }

  getParsedDate(dateString: string) {
    if (!dateString) {
      return '--';
    }
    const date = moment(dateString).format('DD/MM/YYYY');
    const time = moment(dateString)
      // .subtract(5, 'hour')
      // .subtract(30, 'minute')
      .format('LT');

    if (date === 'Invalid date' || time === 'Invalid date') {
      return '--';
    }

    return date;
  }

  goBack() {
    this.router.navigate(['../add-mr'], {
      relativeTo: this.route,
      queryParams: {
        ownerId: this.animalHistoryDetail?.animalResponse?.ownerId,
      },
    });
  }
  addNewPage() {
    if (
      this.animalHistoryDetail?.animalResponse &&
      this.animalHistoryDetail?.animalResponse['milkingStatus'] == 'In Milk' &&
      this.animalHistoryDetail?.animalResponse?.animalStatusCd === 1
    ) {
      this.router.navigate(['../add-mr-form'], {
        relativeTo: this.route,
        queryParams: { tagId: this.animalHistoryDetail?.animalResponse?.tagId },
      });
    } else {
      if (this.animalHistoryDetail?.animalResponse?.animalStatusCd !== 1) {
        new SnackBarMessage(this._snackBar).onSucessMessage(
          this.translatePipe.transform('errorMsg.animal_not_active'),
          this.translatePipe.transform('common.ok_string'),
          'center',
          'top',
          'red-snackbar'
        );
      } else if (
        this.animalHistoryDetail?.animalResponse['milkingStatus'] !== 'In Milk'
      ) {
        new SnackBarMessage(this._snackBar).onSucessMessage(
          this.translatePipe.transform('errorMsg.animal_is_not_in_milk'),
          this.translatePipe.transform('common.ok_string'),
          'center',
          'top',
          'red-snackbar'
        );
      }
    }
  }

  checkNull(value: any) {
    return typeof value !== 'undefined' && value !== null;
  }
}
