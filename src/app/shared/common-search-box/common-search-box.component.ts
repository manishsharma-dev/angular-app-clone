import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnChanges,
  Output,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { AnimalDetailService } from 'src/app/features/animal-management/animal-registration/animal-details/animal-detail.service';
import { SearchValidation } from '../../features/performance-recording/search-validator';
import { DataServiceService } from '../shareService/data-service.service';

export type SearchValue = {
  searchValue: string;
  projectId?: string;
  ownerType: OwnerType;
  pageNo?:number,
  itemPerPage?:number
};

export enum OwnerType {
  individual = 1,
  nonIndividual = 2,
  organization = 3,
}

@Component({
  selector: 'app-common-search-box',
  templateUrl: './common-search-box.component.html',
  styleUrls: ['./common-search-box.component.css'],
})
export class CommonSearchBoxComponent implements OnChanges, OnInit, OnDestroy {
  searchForm: FormGroup;

  @Input() inDashboard = false;
  @Input() searchProject = false;
  @Input() searchSampleId = false;
  @Input() searchOnlyTagId = false;
  @Input() searchOrganization = true;
  @Input() searchNonIndividual = true;
  @Input() ownerTypeCd: OwnerType = OwnerType.individual;
  @Input() orgId: number = null;
  @Input() isVaccination = false;
  @Output() ownerTypeCdChange = new EventEmitter<OwnerType>();
  @Output() reset = new EventEmitter<void>();
  @Output() search = new EventEmitter<SearchValue>();
  @Output() projectChange = new EventEmitter<string>();

  orgsList = [];
  userProjects = [];
  isLoading = false;
  searchPlaceholder = '';
  subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private animalDS: AnimalDetailService,
    private dataService: DataServiceService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['ownerTypeCd']) {
      if (
        !this.searchOrganization &&
        changes['ownerTypeCd']?.currentValue === OwnerType.organization
      ) {
        this.ownerTypeCd = OwnerType.individual;
      } else {
        this.searchForm
          ?.get('ownerType')
          .patchValue(
            changes['ownerTypeCd']?.currentValue ?? OwnerType.organization,
            { emitEvent: false }
          );
      }
    }

    if (changes['orgId']) {
      this.searchForm?.get('searchValue')?.patchValue(this.orgId);
    }
  }

  ngOnInit(): void {
    if (this.searchOnlyTagId) {
      this.searchOrganization = false;
      this.searchProject = false;
      this.searchSampleId = false;
      this.searchNonIndividual = false;
      this.searchPlaceholder = 'errorMsg.please_enter_tag_id';
    } else if (this.searchSampleId) {
      this.searchPlaceholder =
        'performanceRecording.common_search_with_sample_placeholder';
    } else {
      this.searchPlaceholder = 'performanceRecording.common_search_placeholder';
    }

    if (this.searchProject && !this.searchOnlyTagId) {
      if (JSON.parse(sessionStorage.getItem('user'))?.userProject?.length) {
        this.userProjects = JSON.parse(
          sessionStorage.getItem('user')
        )?.userProject;
      }
      this.getProjectInformation();
    }

    if (this.searchOrganization) {
      const sub = this.animalDS.getOrgs().subscribe(
        (data) => {
          this.orgsList = data;
          this.isLoading = false;
        },
        () => (this.isLoading = false)
      );
      this.subscriptions.push(sub);
    }

    this.initForm();
  }

  initForm() {
    this.searchForm = new FormGroup(
      {
        ownerType: new FormControl(this.ownerTypeCd),
        searchValue: new FormControl(null, [Validators.required]),
        projectId: new FormControl(),
      },
      {
        validators: [
          SearchValidation(this.searchOnlyTagId, this.searchSampleId),
        ],
      }
    );

    const sub1 = this.searchForm
      .get('projectId')
      .valueChanges.pipe(
        distinctUntilChanged(),
        filter((value) => !!(value && +value))
      )
      .subscribe((projectId: string) => {
        this.projectChange.emit(projectId);
      });
    const sub2 = this.searchForm
      .get('ownerType')
      .valueChanges.pipe(distinctUntilChanged())
      .subscribe((value) => {
        this.resetValue(value);
        this.ownerTypeCdChange.emit(value);
      });

    this.subscriptions.push(sub1, sub2);
    const { projectId, searchValue, ownerType } =
      this.route.snapshot.queryParams;

    this.searchForm.patchValue({
      projectId: projectId ?? null,
      ownerType: ownerType ? +ownerType : OwnerType.individual,
      searchValue: searchValue
        ? ownerType === OwnerType.organization
          ? +searchValue
          : searchValue
        : null,
    });
    if (!this.isVaccination) this.searchResults(true);
  }

  searchResults(onInit = false) {
    if (this.searchForm.invalid && !this.isVaccination) {
      if (!onInit) this.searchForm.markAllAsTouched();
      return;
    }
    const searchValue = typeof this.searchForm.value?.searchValue === 'string' ?
                        this.searchForm.value?.searchValue :this.searchForm.value?.searchValue.toString()
                        
    const value = {
      ...this.searchForm.value,
      searchValue: searchValue?.trim(),
    };
    if (!this.isVaccination) this.addQueryParams();

    this.search.emit(value);
  }

  getProjectInformation(): void {
    const projectSub = this.dataService.fetchProjectInfo.subscribe(
      (projectID) => {
        if (projectID && projectID !== '0') {
          this.searchForm?.get('projectId')?.setValue(projectID);
        } else {
          this.searchForm?.get('projectId')?.reset();
        }
      }
    );
    this.subscriptions.push(projectSub);
  }

  resetValue(value?: OwnerType) {
    this.searchForm.reset({ ownerType: value ?? OwnerType.individual });
    this.router.navigate(['.'], { relativeTo: this.route });
    this.orgId = null;
    this.reset.emit();
  }

  changeOwnerType() {
    this.searchForm.patchValue({ searchValue: null, projectId: null });
  }

  addQueryParams() {
    const searchValue = typeof this.searchForm.value?.searchValue === 'string' ?
    this.searchForm.value?.searchValue :this.searchForm.value?.searchValue.toString()
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: {
        ...this.searchForm.value,
        searchValue: searchValue?.trim()
      },
    });
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription?.unsubscribe();
    }
  }

  get ownerType() {
    return OwnerType;
  }
}
