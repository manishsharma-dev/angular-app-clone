import { Component, OnInit } from '@angular/core';
import { PrService } from '../../pr.service';
import { MatTableDataSource } from '@angular/material/table';
import { AnimalTreatmentService } from 'src/app/features/animal-health/animal-treatment/animal-treatment.service';

@Component({
  selector: 'app-animal-search-details',
  templateUrl: './animal-search-details.component.html',
  styleUrls: ['./animal-search-details.component.css'],
})
export class AnimalSearchDetailsComponent implements OnInit {
  isLoadingSpinner = false;
  isTableVisible = false;
  ownerDetailsRecord = [];
  ownerDetailsByID: any = {};
  tableDataSource = new MatTableDataSource([]);
  clickedOwnerName = '';
  clickedOwnerMobNo = '';
  ownerDetailsSection = false;
  animalDetailsSection = false;
  isAnimalTabVisible = false;

  constructor(private prService: PrService, private treatmentService: AnimalTreatmentService) {}

  ngOnInit(): void {}

  getOwnerDetailsByID(ownerId: string) {
    this.isLoadingSpinner = true;
    this.prService.getSearchDetails(ownerId).subscribe(
      (data) => {
        this.ownerDetailsByID = data[0];
        this.isLoadingSpinner = false;
        if (
          this.ownerDetailsByID.animalsList &&
          this.ownerDetailsByID.animalsList.length
        ) {
          for (let animal of this.ownerDetailsByID.animalsList) {
            if (animal.ageInMonths) {
              animal.ageInMonths = this.getWords(animal.ageInMonths);
            }
            animal['breedDesc'] =
              animal.breedAndExoticLevels &&
              animal.breedAndExoticLevels.length > 1
                ? 'Cross Breed'
                : animal.breedAndExoticLevels &&
                  animal.breedAndExoticLevels.length
                ? animal.breedAndExoticLevels[0].breed
                : '--';
          }
        }
        this.tableDataSource.data = this.ownerDetailsByID.animalsList ?? [];
        this.clickedOwnerName =
          this.ownerDetailsByID.ownerFirstName +
          ' ' +
          this.ownerDetailsByID?.ownerMiddleName +
          ' ' +
          this.ownerDetailsByID.ownerLastName;
        this.clickedOwnerMobNo = this.ownerDetailsByID?.ownerMobileNo;

        this.isTableVisible = false;
        this.ownerDetailsSection = true;
        this.animalDetailsSection = true;
      },
      () => {
        this.isLoadingSpinner = false;
        this.tableDataSource.data = [];
        this.isTableVisible = false;
        this.ownerDetailsSection = false;
        this.animalDetailsSection = false;
        this.isAnimalTabVisible = false;
      }
    );
  }

  getWords(monthCount: any) {
    return monthCount ? this.treatmentService.getWords(monthCount) : null;
  }

  openOtpDialog(key: any) {}

}
