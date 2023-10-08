import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AnimalMasterList } from 'src/app/features/animal-health/animal-treatment/models/master.model';
import { HealthService } from 'src/app/features/animal-health/health.service';
import { MasterConfig } from 'src/app/shared/master.config';
import { HealthHistoryComponent } from '../../animal-health/components/health-history/health-history.component';

@Component({
  selector: 'app-status-report',
  templateUrl: './status-report.component.html',
  styleUrls: ['./status-report.component.css'],
  providers: [TranslatePipe],
})
export class StatusReportComponent implements OnInit {
  selectedAnimal: any;
  selectedAnimalId: any;
  isLoading = false;
  ownerRegistrationFlag: boolean = false;
  ownerDetailsSection: boolean = false;
  animalDetailsSection: boolean = false;
  isAnimalTabVisible: boolean = false;
  isTableVisible: boolean = false;
  errorMessage: string = '';
  tableDataSource = new MatTableDataSource([]);
  ownerDetailsByID: object;
  animalKeys: string[] = [
    'taggingDate',
    'tagId',
    'species',
    'speciesCd',
    'isLoanOnAnimal',
    'dateOfBirth',
    'ownerId',
    'registrationDate',
    'registrationStatus',
    'sex',
    'ageInMonths',
    'animalStatusCd',
    'animalStatus',
    'animalId',
    'animalName',
    'pregnancyStatus',
    'milkingStatus',
    'animalCategory',
  ];
  displayedColumns: string[] = [
    'tagId',
    'taggingDate',
    'species',
    'category',
    'breedDesc',
    'sex',
    'ageInMonths',
    'pregnancyStatus',
    'milkingStatus',
    'status',
  ];
  noOfActiveAnimals = 0;
  animal: any;

  resetValue() {
    this.ownerRegistrationFlag = false;
    this.ownerDetailsSection = false;
    this.animalDetailsSection = false;
    this.isAnimalTabVisible = false;
    this.isTableVisible = false;
    this.errorMessage = '';
    this.ownerDetailsByID = null;
    this.router.navigate(['.'], { relativeTo: this.route });
  }
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private healthService: HealthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {}

  searchResults(searchValue: string) {
    this.isLoading = true;
    this.healthService.getDetailsByTagID(searchValue.trim()).subscribe(
      (searchResult: any) => {
        this.isLoading = false;
        this.ownerDetailsByID = searchResult.ownerDetails;
        var animalList: any = <AnimalMasterList>{};
        for (let key of this.animalKeys) {
          animalList[key] = searchResult[key];
        }
        if (searchResult?.animalId) {
          if (
            searchResult.isLoanOnAnimal &&
            !searchResult?.animalStatus?.includes('Sold')
          ) {
            this.noOfActiveAnimals += 1;
          }
        }
        animalList.ageInMonths = this.healthService.getWords(
          animalList.ageInMonths
        );
        animalList['breedDesc'] =
          animalList.breedAndExoticLevels &&
          animalList.breedAndExoticLevels.length > 1
            ? 'Cross Breed'
            : animalList.breedAndExoticLevels &&
              animalList.breedAndExoticLevels.length
            ? animalList.breedAndExoticLevels[0].breed
            : 'NA';
        this.tableDataSource.data = [animalList];
        this.animal = animalList;
        this.isTableVisible = false;
        this.ownerDetailsSection = true;
        this.animalDetailsSection = true;
        this.isAnimalTabVisible = true;
      },
      (error) => {
        this.isLoading = false;
        this.tableDataSource.data = [];
        this.isTableVisible = false;
        this.ownerDetailsSection = false;
        this.animalDetailsSection = false;
        this.isAnimalTabVisible = false;
        this.isTableVisible = false;
      }
    );
  }

  viewHistory() {
    this.dialog.open(HealthHistoryComponent, {
      data: {
        animalData: this.animal,
        animalHistoryCd: 1,
        parent: 'status-report',
      },
      width: '700px',
      height: '100vh',
      panelClass: 'custom-dialog-container',
      position: {
        right: '0px',
        top: '0px',
      },
    });
  }
}
