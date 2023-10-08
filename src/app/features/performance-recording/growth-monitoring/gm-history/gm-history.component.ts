import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { switchMap } from 'rxjs/operators';
import { ModifyAnimalDetailsComponent } from 'src/app/features/animal-breeding/modify-animal-details/modify-animal-details.component';
import { HealthService } from 'src/app/features/animal-health/health.service';
import { MasterConfig } from 'src/app/shared/master.config';
import { SnackBarMessage } from 'src/app/shared/snack-bar';
import { GrowthMonitoringService } from '../growth-monitoring.service';
import { GrowthHistoryRes } from '../models/animal-growth-history-res.model';

@Component({
  selector: 'app-gm-history',
  templateUrl: './gm-history.component.html',
  styleUrls: ['./gm-history.component.css'],
  providers: [TranslatePipe]
})
export class GmHistoryComponent implements OnInit {
  masterConfig = MasterConfig;
  isLoadingSpinner = false;
  animal!: GrowthHistoryRes['animalResponse'];
  dataSource = new MatTableDataSource<
    GrowthHistoryRes['animalGrowthResponseList'][0]
  >([]);
  displayedColumns = [
    'S. No.',
    'gmDate',
    'length',
    'girth',
    'weight',
    'growthRate',
  ];

  @ViewChild(MatSort) set sort(s: MatSort) {
    this.dataSource.sort = s;
  }

  constructor(
    private healthService: HealthService,
    private route: ActivatedRoute,
    private router: Router,
    private gmService: GrowthMonitoringService,
    private _snackBar: MatSnackBar,
    private dialog: MatDialog,
    private translatePipe: TranslatePipe
  ) {}

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.isLoadingSpinner = true;
    this.route.queryParamMap
      .pipe(
        switchMap((params) => {
          return this.gmService.animalGrowthHistory(+params.get('tagId'));
        })
      )
      .subscribe(
        (res) => {
          this.isLoadingSpinner = false;
          this.animal = res.animalResponse;
          this.dataSource.data = res.animalGrowthResponseList;
        },
        () => (this.isLoadingSpinner = false)
      );
  }

  getAnimalAge(ageInMonths: number) {
    return this.healthService.getWords(ageInMonths);
  }

  redirectToNewGm() {
    if (
      (this.animal.sex === 'F' &&
        (typeof this.animal.milkingStatus === 'undefined' ||
          this.animal.milkingStatus === null)) ||
      typeof this.animal.breedAndExoticLevels === 'undefined' ||
      this.animal.breedAndExoticLevels === null ||
      this.animal.breedAndExoticLevels?.length === 0
    ) {
      this.addAnimalAdditionalDetails();
      return;
    }
    if (
      (this.animal.sex === 'M' && this.animal.ageInMonths > 36) ||
      (this.animal.sex === 'F' &&
        // !isNaN(+this.animal.numberCalvings) &&
        this.animal.milkingStatus !== 'NA')
    ) {
      new SnackBarMessage(this._snackBar).onSucessMessage(
        this.translatePipe.transform('errorMsg.not_eleible_gm'),
        this.translatePipe.transform('common.ok_string'),
        'center',
        'top',
        'red-snackbar'
      );
    } else {
      this.router.navigate(['..', 'new-gm'], {
        relativeTo: this.route,
        queryParams: { animalId: this.animal?.animalId },
      });
    }
  }

  addAnimalAdditionalDetails(isView?: boolean) {
    if (this.animal) {
      const dialogRef = this.dialog.open(ModifyAnimalDetailsComponent, {
        data: {
          animalData: this.animal,
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
        if (res) this.getData();
      });
    }
  }

  goBack() {
    this.router.navigate([
      '/dashboard/performance-recording/growth-monitoring',
    ]);
  }
}
