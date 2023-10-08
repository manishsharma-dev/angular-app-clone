import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { forkJoin } from 'rxjs';
import { PrService } from 'src/app/features/performance-recording/pr.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { CountryService } from 'src/app/shared/shareService/country-service.service';
import { DataServiceService } from 'src/app/shared/shareService/data-service.service';
import { StateList } from 'src/app/shared/shareService/model/state.model';
import { animalBreedingValidations } from 'src/app/shared/validatator';
import { BullMasterService } from '../../bull-master/bull-master.service';
import { SuccessDialogComponent } from '../../success-dialog/success-dialog.component';
import { CreateReq } from '../test-ai-model/test-ai-req.model';
import { District, Tehsil } from '../test-ai-model/test-ai.model';
import { TestAIService } from '../test-ai.service';
import { Village } from 'src/app/features/animal-health/intimation-report/models/village.model';
import { getDecryptedProjectData } from 'src/app/shared/shareService/storageData';
import { AlphaNumericSpecialValidation } from 'src/app/shared/utility/validation';
import { animalBreedingPRConfig } from 'src/app/shared/animal-breeding-pr.config';
import { ConfirmationDeleteDialogComponent } from 'src/app/shared/confirmation-delete-dialog/confirmation-delete-dialog.component';

@Component({
  selector: 'app-create-test-plan',
  templateUrl: './create-test-plan.component.html',
  styleUrls: ['./create-test-plan.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class CreateTestPlanComponent implements OnInit {
  commonValidationMsg = animalBreedingValidations.common;
  validationMsg = animalBreedingValidations.testAI;

  isLoadingSpinner: boolean = false;
  basicDetailForm: FormGroup;
  // testingDetailForm: FormGroup;
  step = 0;
  selectedVillages = [];
  statesList: Village[] = [];
  districtList: District[] = [];
  tehsilList: Tehsil[] = [];
  areaList: Village[] = [];
  villages: Village[][] = [];
  selectedVillagesCount = 0;
  dataSource = new MatTableDataSource<any>([]);
  columnsToDisplay = ['check', 'bullId', 'semenStation', 'species', 'breed'];
  innerColumnsToDisplay = [...this.columnsToDisplay];
  selectedBulls = [];
  orgsList: any[] = [];
  filterForm: FormGroup;
  userDetails: any;
  private paginator!: MatPaginator;
  projectId: any;
  backDate = '';
  futureDate = '';
  submitStatus = {
    selectAnimalForm: true,
    testingDetailForm: false,
    basicDetailForm: false,
  };
  totalRows = 1000;
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions: number[] = [5, 10, 25, 50];
  currentDate = sessionStorage.getItem('serverCurrentDateTime')
  isSelectAll: boolean = false
  @ViewChild(MatSort) set sort(sort: MatSort) {
    this.dataSource.sort = sort;
  }
  @ViewChild('paginatorRef') set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }

  setDataSourceAttributes() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  constructor(
    private dialog: MatDialog,
    private _fb: FormBuilder,
    private countryService: CountryService,
    private bullMasterService: BullMasterService,
    private testAiService: TestAIService,
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataServiceService,
    private prService: PrService
  ) { }

  ngOnInit(): void {
    this.initForm();

    this.filterForm = this._fb.group({
      semenStationCodes: [[]],
      bullId: [],
      breedCd: [],
    });

    this.addVillageTehsilsRow();
    // this.getStatesDetails();
    const subOrganisationType = {
      subOrgType: 2,
      stateCheck: true
    };
    this.isLoadingSpinner = true;
    forkJoin([
      this.prService.getVillagesByUser(),
      this.bullMasterService.getOrganizationList(subOrganisationType),
      this.prService.getConfigDetails([
        animalBreedingPRConfig.backdate.TestAIBackdate,
        animalBreedingPRConfig.backdate.TestAIFutureDate,
      ]),
    ]).subscribe((res) => {
      this.areaList = res[0];
      for (const area of res[0]) {
        if (
          this.statesList.findIndex(
            (state) => state.stateCd === area.stateCd
          ) === -1
        ) {
          this.statesList = [...this.statesList, area];
        }
      }
      this.orgsList = (res[1] as any[]).filter(
        (org) => org.subOrgType == 2 && org.subOrgStatus == 1
      );

      this.backDate = moment(this.currentDate)
        .subtract(
          +res[2][0][animalBreedingPRConfig.backdate.TestAIBackdate].defaultValue, 'days'
        )
        .format('YYYY-MM-DD');
      this.futureDate = moment(this.currentDate)
        .add(
          +res[2][1][animalBreedingPRConfig.backdate.TestAIFutureDate]
            .defaultValue, 'days'
        )
        .format('YYYY-MM-DD');
      this.isLoadingSpinner = false;
    });
    this.userDetails = this.dataService._fetchLoggedUserDatails();
    this.detectStorageforProject();
    this.detectProject();
  }

  get villageTehsilsControls() {
    return (this.basicDetailForm.get('testAiLocationMapDto') as FormArray)
      .controls as FormGroup[];
  }

  addVillageTehsilsRow() {
    this.villages.push([]);
    (this.basicDetailForm.get('testAiLocationMapDto') as FormArray).push(
      this.createTehsilVillageRow()
    );
  }

  removeVillageTehsilsRow(index: number): void {
    const arr = this.basicDetailForm.get('testAiLocationMapDto') as FormArray;

    if (arr.length === 1) {
      arr.reset();
      return;
    }

    (this.basicDetailForm.get('testAiLocationMapDto') as FormArray).removeAt(
      index
    );
  }

  selectAllForDropdownItems(items: any[]) {
    let allSelect = (items) => {
      items.forEach((element) => {
        element['selectedAllGroup'] = 'selectedAllGroup';
      });
    };

    allSelect(items);
  }


  onCheckBoxChange(
    event: Event,
    element: any,
    i: number,
    isParent: boolean,
    parentElement?: any
  ) {
    if (isParent) {
      element.bull.checked = (event.target as HTMLInputElement).checked;
      if (element && element?.associatedBullsList) {
        element.associatedBullsList.forEach((a) => {
          const isAnimalAvailable = this.selectedBulls.filter(bull => bull.bullId == a.bullId)
          if (isAnimalAvailable.length == 0) {
            this.selectedBulls.push({
              bullId: a?.bullId,
              animalId: a?.animalId,
              tagId: a?.tagId,
              testPlanId: this.basicDetailForm.get('testPlanId').value,
            });
          }
          a.checked = element.bull.checked;

        });
      }

      if (element.bull.checked) {
        this.selectedBulls.push({
          bullId: element?.bull?.bullId,
          animalId: element?.bull?.animalId,
          tagId: element?.bull?.tagId,
          testPlanId: this.basicDetailForm.get('testPlanId').value,
        });
      } else {
        const i = this.selectedBulls.findIndex(
          (bull) => bull.bullId === element.bull.bullId
        );
        this.selectedBulls.splice(i, 1);
      }
    } else {
      element.checked = (event.target as HTMLInputElement).checked;
      let checked = true;
      parentElement.associatedBullsList.forEach((a) => {
        checked = checked && a.checked;
      });
      // parentElement.bull.checked = checked;
      if (element.checked) {
        this.selectedBulls.push({
          bullId: element?.bullId,
          animalId: element?.animalId,
          tagId: element?.tagId,
          testPlanId: this.basicDetailForm.get('testPlanId').value,
        });
      } else {
        const i = this.selectedBulls.findIndex(
          (bull) => bull.bullId === element.bullId
        );
        this.selectedBulls.splice(i, 1);
      }
    }
    this.dataSource._updateChangeSubscription();
  }

  checkIfSelected(element, isParent: boolean) {
    if (isParent) {
      return element.bull.checked;
    } else {
      return element.checked;
    }
  }

  selectAll(event?: Event) {

    const value = event ? (event.target as HTMLInputElement).checked : this.isSelectAll;
    this.isSelectAll = value
    this.dataSource.data.forEach((a) => {
      a.bull.checked = value;
      a.associatedBullsList?.forEach((bull) => {
        bull.checked = value;
      });
    });
    if (value) {
      const selectedBull = this.dataSource.data.map((bull) => ({
        bullId: bull.bull.bullId,
        animalId: bull.bull.animalId,
        tagId: bull.bull.animalId,
      }));
      if (this.selectedBulls && this.selectedBulls?.length > 0) {
        var matchedBull = this.selectedBulls.filter(function (obj) { return selectedBull.indexOf(obj) == -1; });
        if (matchedBull && matchedBull?.length > 0) {
          this.selectedBulls.push.apply(this.selectedBulls, selectedBull)
          this.selectedBulls = this.selectedBulls.filter((value, index, self) =>
            index === self.findIndex((t) => (
              t.bullId === value.bullId
            ))

          )
        }

        else this.selectedBulls = selectedBull
      } else {
        this.selectedBulls = selectedBull
      }
    } else {
      this.selectedBulls.length = 0;
    }
    console.log (this.selectedBulls.length,this.dataSource.data.length)
  }
  getDistrictDetails(value: number): void {
    this.tehsilList.length = 0;
    this.villages.length = 0;

    this.basicDetailForm.get('districtCd')?.reset();

    this.basicDetailForm.get('tehsilCd')?.reset();
    if (value == null) {
      return;
    }
    // this.isLoadingSpinner = true;

    const arr = this.basicDetailForm?.get('testAiLocationMapDto') as FormArray;
    while (arr?.length) {
      arr.removeAt(0);
    }
    this.addVillageTehsilsRow();

    this.districtList = this.areaList.filter(
      (district, index, self) =>
        district.stateCd === value &&
        self.findIndex((v) => v.districtCd === district.districtCd) === index
    );
  }

  getTehsilDetails(value: number): void {
    this.villages.length = 0;

    const arr = this.basicDetailForm?.get('testAiLocationMapDto') as FormArray;
    while (arr?.length) {
      arr.removeAt(0);
    }
    this.addVillageTehsilsRow();
    if (value == null) {
      return;
    }
    // this.isLoadingSpinner = true;

    const districtCode = value;
    this.tehsilList = this.areaList.filter(
      (tehsil, index, self) =>
        tehsil.districtCd === value &&
        self.findIndex((v) => v.tehsilCd === tehsil.tehsilCd) === index
    );
  }

  getVillagesDetails(value: number, i: number): void {
    const arr = this.basicDetailForm?.get('testAiLocationMapDto') as FormArray;
    arr?.at(i)?.get('villageCd')?.reset();
    if (value == null) {
      return;
    }

    if (arr.value.some((v, index) => i !== index && v.tehsilCd === value)) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: 'Tehsil Already Selected!',
          message: 'Please select another tehsil',
          primaryBtnText: 'Ok',
          icon: 'assets/images/alert.svg',
        },
        panelClass: 'common-info-dialog',
      });
      arr.at(i).patchValue({ tehsilCd: null });
      return;
    }

    // this.isLoadingSpinner = true;

    this.villages[i].length = 0;

    const tehsilCode = value;
    // this.countryService.getVillages(tehsilCode).subscribe(
    //   (data) => {
    //     this.villages[i] = data as any as Village[];
    //     this.selectAllForDropdownItems(this.villages[i]);
    //     this.isLoadingSpinner = false;
    //   },
    //   (error) => {
    //     this.isLoadingSpinner = false;
    //   }
    // );
    this.villages[i] = this.areaList.filter(
      (village, index, self) =>
        village.tehsilCd === value &&
        self.findIndex((v) => v.villageCd === village.villageCd) === index
    );
  }
  searchInTable(event) {
    const filterValue = (event.target as HTMLInputElement).value;
    // console.log(this.dataSource.data)
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }

    this.dataSource.data.forEach((table, index) => {
      // console.log(table,(table.dataSource as MatTableDataSource<any>));
      table.filter = filterValue.trim().toLowerCase();
    });
  }
  // applyFilter(event) {

  //   const filterValue = (event.target as HTMLInputElement).value;
  //   this.dataSource.data.forEach((table, index) => (table.dataSource as MatTableDataSource<any>).filter = filterValue.trim().toLowerCase());
  // }

  private initForm(): void {
    this.basicDetailForm = this._fb.group({
      testAiLocationMapDto: this._fb.array([]),
      projectId: [
        { value: this.projectId, disabled: true },
        [Validators.required],
      ],
      testPlanName: [
        null,
        [Validators.required, AlphaNumericSpecialValidation],
      ],
      startDate: [this.previousDay, {
        updateOn: 'blur',
        validators: [
          Validators.required,
        ],
      }],
      endDate: [this.today, {
        updateOn: 'blur',
        validators: [
          Validators.required,
        ],
      }],
      stateCd: [null, [Validators.required]],
      districtCd: [null, [Validators.required]],
      testPlanId: [0],
    });

    this.basicDetailForm.get('testAiLocationMapDto').valueChanges.subscribe(
      (
        value: {
          villageCd: number[];
          tehsilCd: number;
        }[]
      ) => {
        this.selectedVillagesCount = 0;
        for (const v of value) {
          this.selectedVillagesCount += v?.villageCd?.length ?? 0;
        }
      }
    );
  }

  getBullList(source: string, isPaginator?: boolean) {
    const value = this.filterForm.value;
    const reqObj: any = {};

    if (source == 'bullId' && value.bullId != null) {
      reqObj.bullId = value.bullId;
    }
    if (
      source == 'semenStationCodes' &&
      value.semenStationCodes != null &&
      value.semenStationCodes?.length
    ) {
      reqObj.semenStationCodes = value.semenStationCodes;
      reqObj.pageNo = isPaginator ? this.currentPage : 0;
      reqObj.itemPerPage = this.pageSize
    }
    if (source == 'breedCd' && value.breedCd != null) {
      reqObj.breedCd = value.breedCd;
    }
    if (Object.keys(reqObj).length == 0) {
      return;
    }

    this.isLoadingSpinner = true;
    this.testAiService[
      source == 'bullId' ? 'getBullForTestAI' : 'getBullsListForTestAIPlan'
    ](reqObj).subscribe(
      (res) => {
        this.isLoadingSpinner = false;
        const arr = [];
        if (Array.isArray(res)) {
          res?.forEach((element) => {
            if (
              this.dataSource.data.findIndex(
                (bull) => element.bull.bullId === bull.bull.bullId
              ) === -1
            ) {
              const isBulllSelected = this.checkBullSelection(element.bull.bullId)
              element.bull['checked'] = isBulllSelected && isBulllSelected?.length > 0 ? true : false;
              element?.associatedBullsList?.forEach((v) => {
                const isassociateSelected = this.checkBullSelection(v.bullId)
                v.checked = isassociateSelected && isassociateSelected.length > 0 ? true : false;
              });
              arr.push(element);
              this.dataSource = new MatTableDataSource(
                arr
              );
            }
          });
        } else {
          if (
            this.dataSource.data.findIndex(
              (bull) => res.bull.animalId === bull.bull.animalId
            ) === -1
          ) {
            const isBulllSelected = this.checkBullSelection(res.bull.bullId)
            res.bull['checked'] = isBulllSelected && isBulllSelected?.length > 0 ? true : false;
            res?.associatedBullsList?.forEach((v) => {
              const isassociateSelected = this.checkBullSelection(v.bullId)
              v.checked = isassociateSelected && isassociateSelected.length > 0 ? true : false;
            });
            arr.push(res);
            this.dataSource.data.push(...arr);
          }
        }
        // this.dataSource =  new MatTableDataSource(
        //   arr
        // );
        // this.dataSource.data.push(...arr);
        this.dataSource._updateChangeSubscription();
        if (this.isSelectAll) this.selectAll();
      },
      () => (this.isLoadingSpinner = false)
    );
  }

  private createTehsilVillageRow() {
    return this._fb.group({
      villageCd: [null, [Validators.required]],
      tehsilCd: [null, [Validators.required]],
    });
  }

  onSubmit() {
    if (this.basicDetailForm.invalid) {
      this.step = 0;
      this.basicDetailForm.markAllAsTouched();
      return;
    }
    if (this.selectedBulls.length === 0) {
      this.step = 1;
      return;
    }

    if (!this.projectId || this.projectId == '0') {
      this.confirmtionDialoug('animalBreeding.commonLabel.select_project')
      return;
    }

    const formValue = this.basicDetailForm.value;
    formValue.projectId = this.projectId;
    //  console.log(formValue,formValue.testAiLocationMapDto)

    const reqObj: CreateReq = {
      ...formValue,
      startDate: moment(formValue.startDate).format('YYYY-MM-DD'),
      endDate: moment(formValue.endDate).format('YYYY-MM-DD'),
      testAiLocationMapDto: this.locationDetails(
        formValue.testAiLocationMapDto
      ),
      testAiAnimalDetailsDto: this.selectedBulls,
    };
    this.isLoadingSpinner = true;
    this.testAiService.saveTestAiDetails(reqObj).subscribe(
      (res) => {
        this.isLoadingSpinner = false;
        this.dialog
          .open(SuccessDialogComponent, {
            data: {
              title: `animalDetails.Test_plan_submit`,
              testPlanId: res.testPlanId,
            },
            disableClose: true,
          })
          .afterClosed()
          .subscribe(() => {
            this.router.navigate(['..'], { relativeTo: this.route });
          });
      },
      () => (this.isLoadingSpinner = false)
    );
  }

  get basicDetailFormControls() {
    return this.basicDetailForm.controls;
  }

  get today() {
    return moment(this.currentDate).format('YYYY-MM-DD');
  }

  get previousDay() {
    return moment(this.currentDate).subtract(1, 'day').format('YYYY-MM-DD');
  }

  setStep(index: number) {
    this.step = index;
  }

  nextStep(form: FormGroup) {
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }
    switch (form) {
      case this.basicDetailForm:
        this.submitStatus.basicDetailForm = true;
        break;
    }
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  onReset(form: FormGroup) {
    // form.reset();
    switch (form) {
      case this.filterForm:
        this.dataSource.data.length = 0;
        this.selectedBulls.length = 0;
        break;

      case this.basicDetailForm:
        const loc = this.basicDetailForm.get(
          'testAiLocationMapDto'
        ) as FormArray;
        while (loc.length) {
          loc.removeAt(0);
        }
        this.addVillageTehsilsRow();
        break;
    }
  }
  onRemove(ev: any) {
    this.dataSource.data = this.dataSource.data.filter(
      (element) =>
        ev.value ===
        element.element?.subOrganizationDetailsResponceDto?.subOrgId
    );
  }
  resetSemenStation() {
    this.dataSource.data = [];
    this.selectedBulls = []
  }
  locationDetails(location: any) {
    const arr = location;
    let locationDetail = [];
    if (arr && arr.length > 0) {
      arr?.forEach((element) => {
        element?.villageCd?.forEach((village) => {
          let locationObj = {
            districtCd: this.basicDetailForm.get('districtCd').value,
            tehsilCd: element?.tehsilCd,
            testPlanId: this.basicDetailForm.get('testPlanId').value,
            villageCd: village,
          };
          locationDetail.push(locationObj);
        });
      });
    }

    return locationDetail;
  }
  goBack(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
  detectProject(): void {
    this.dataService.fetchProjectInfo.subscribe((projectID) => {
      if (projectID != '0') {
        this.projectId = projectID;
        this.basicDetailForm.get('projectId').patchValue(projectID);
      } else {
        this.projectId = null;
        this.basicDetailForm.get('projectId').reset();
      }
    });
  }

  detectStorageforProject(): void {
    this.projectId = getDecryptedProjectData('AESSHA256storageProjectData')?.id;

    if (this.projectId == '0') this.projectId = null;
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.getBullList('semenStationCodes', true);
  }
  checkBullSelection(bull_id: any) {
    const selectBull = this.selectedBulls?.filter(val => val?.bullId == bull_id)
    return selectBull
  }
  private confirmtionDialoug(message: string): void {
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
}
