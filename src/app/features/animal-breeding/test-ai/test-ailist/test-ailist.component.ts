import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import moment from 'moment';
import { PrService } from 'src/app/features/performance-recording/pr.service';
import { MasterConfig } from 'src/app/shared/master.config';
import { CountryService } from 'src/app/shared/shareService/country-service.service';
import { DataServiceService } from 'src/app/shared/shareService/data-service.service';
import { getDecryptedProjectData } from 'src/app/shared/shareService/storageData';
import { SearchTestAIRes } from '../test-ai-model/search-test-ai-res.model';
import { TestAIService } from '../test-ai.service';
import { ViewTestPlanDetailsComponent } from '../view-test-plan-details/view-test-plan-details.component';

@Component({
  selector: 'app-test-ailist',
  templateUrl: './test-ailist.component.html',
  styleUrls: ['./test-ailist.component.css'],
})
export class TestAIListComponent implements OnInit {
  masterConfig = MasterConfig;
  isLoadingSpinner: boolean = false;
  searchForm!: FormGroup;
  tableDataSource = new MatTableDataSource<SearchTestAIRes>([]);
  userDetails: any;
  statesList = [];
  districtList = [];
  tehsilList = [];
  villageList = [];
  villages = [];
  projectId: any;
  displayedColumns = [
    '#',
    'testPlanName',
    'testPlanId',
    'creationDate',
    'startDate',
    'endDate',
    'bullId',
    'tagId',
    'villageCd',
  ];
  currentDate = sessionStorage.getItem('serverCurrentDateTime')
  constructor(
    private _formBuilder: FormBuilder,
    private testAIService: TestAIService,
    private dialog: MatDialog,
    private dataService: DataServiceService,
    private prService: PrService
  ) {}

  @ViewChild('paginatorRef') set paginator(paginator: MatPaginator) {
    this.tableDataSource.paginator = paginator;
  }

  @ViewChild(MatSort) set sort(sort: MatSort) {
    this.tableDataSource.sort = sort;
  }

  ngOnInit(): void {
    this.searchForm = this._formBuilder.group({
      // searchText: ['63ABCNDDB123'],
      // fromDate: ['2021-10-09'],
      // toDate: ['2024-10-11'],
      searchText: [],
      fromDate: [null, { updateOn: 'blur',
      validators: [
        Validators.required,
      ],}],
      toDate: [null, { updateOn: 'blur',
      validators: [
        Validators.required,
      ],}],
      projectId: [{ value: this.projectId, disabled: true }],
      villageCd: [],
      stateCd: [],
      districtCd: [],
      tehsilCd: [],
    });

    this.isLoadingSpinner = true;
    // this.countryService.getStates().subscribe((res) => {
    //   this.isLoadingSpinner = false;
    //   this.statesList = res;
    // });
    this.userDetails = this.dataService._fetchLoggedUserDatails();
    this.getCountryList();
    this.detectStorageforProject();
    this.detectProject();
  }

  getCountryList() {
    this.isLoadingSpinner = true;

    this.prService.getVillagesByUser().subscribe(
      (response) => {
        this.villages = response;
        for (const area of response) {
          if (
            this.statesList.findIndex(
              (state) => state.stateCd === area.stateCd
            ) === -1
          ) {
            this.statesList = [...this.statesList, area];
          }
        }
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  getDistrictDetails(value: any): void {
    this.tehsilList.length = 0;
    this.villageList.length = 0;

    this.searchForm.get('districtCd')?.reset();

    this.searchForm.get('tehsilCd')?.reset();
    this.searchForm.get('villageCd')?.reset();
    if (value == null) {
      return;
    }
    // this.isLoadingSpinner = true;

    this.districtList = this.villages.filter(
      (district, index, self) =>
        district.stateCd === value.stateCd &&
        self.findIndex((v) => v.districtCd === district.districtCd) === index
    );
  }

  getTehsilDetails(value: any): void {
    this.villageList.length = 0;
    this.searchForm.get('tehsilCd')?.reset();
    this.searchForm.get('villageCd')?.reset();
    if (value == null) {
      return;
    }
    // this.isLoadingSpinner = true;
    this.tehsilList = this.villages.filter(
      (tehsil, index, self) =>
        tehsil.districtCd === value.districtCd &&
        self.findIndex((v) => v.tehsilCd === tehsil.tehsilCd) === index
    );
  }

  getVillagesDetails(value: any): void {
    this.searchForm.get('villageCd')?.reset();
    if (value == null) {
      return;
    }

    // this.isLoadingSpinner = true;

    this.villageList.length = 0;
    this.villageList = this.villages.filter(
      (village, index, self) =>
        village.tehsilCd === value.tehsilCd &&
        self.findIndex((v) => v.villageCd === village.villageCd) === index
    );
  }

  searchInTable(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableDataSource.filter = filterValue.trim().toLowerCase();
    if (this.tableDataSource.paginator) {
      this.tableDataSource.paginator.firstPage();
    }
  }

  detectProject(): void {
    this.dataService.fetchProjectInfo.subscribe((projectID) => {
      if (projectID != '0') {
        this.projectId = projectID;
        this.searchForm.get('projectId').patchValue(projectID);
      } else {
        this.projectId = null;
        this.searchForm.get('projectId').reset();
      }
    });
  }

  detectStorageforProject(): void {
    this.projectId = getDecryptedProjectData('AESSHA256storageProjectData')?.id;

    if (this.projectId == '0') this.projectId = null;
  }

  searchResults(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    } else {
      this.isLoadingSpinner = true;
      const formValue = {
        ...this.searchForm.value,
      };
      formValue.toDate = moment(formValue.toDate).format('YYYY-MM-DD');
      formValue.fromDate = moment(formValue.fromDate).format('YYYY-MM-DD');
      this.testAIService.searchTestAi(formValue).subscribe(
        (data) => {
          this.isLoadingSpinner = false;
          if (!(data instanceof Array)) {
            // this.dialog
            //   .open(ConfirmationDialogComponent, {
            //     data: {
            //       title: 'common.info_label',
            //       message: 'errorMsg.no_plan_found',
            //       primaryBtnText: 'Ok',
            //       icon: 'assets/images/alert.svg',
            //     },
            //     panelClass: 'common-info-dialog'
            //   })
            //   .afterClosed()
            //   .subscribe(() => this.searchForm.reset());
            this.searchForm.reset();
            this.tableDataSource.data.length = 0;

            return;
          }

          this.tableDataSource.data = data?.map((d: any) => ({
            ...d,
            creationDate: this.formatDate(d.creationDate),
            startDate: this.formatDate(d.startDate),
            endDate: this.formatDate(d.endDate),
          }));
        },
        () => (this.isLoadingSpinner = false)
      );
    }
  }
  get today() {
    return moment(this.currentDate).format('YYYY-MM-DD');
  }
  get previousDay() {
    return moment(this.currentDate).subtract(1, 'day').format('YYYY-MM-DD');
  }

  formatDate(date: string) {
    return moment(date).format('DD/MM/YYYY');
  }
  get basicDetailFormControls() {
    return this.searchForm.controls;
  }
  viewTestPlan() {
    this.dialog.open(ViewTestPlanDetailsComponent, {
      data: { testPlanName: 'Test Plan 1' },
      position: {
        right: '0px',
        top: '0px',
      },
      panelClass: 'custom-dialog-container',
      width: '700px',
      height: '100vh',
    });
  }
}
