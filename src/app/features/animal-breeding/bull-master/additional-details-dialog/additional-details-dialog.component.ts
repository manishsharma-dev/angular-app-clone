import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  Inject,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { AdditionalDetailsFormObj } from './models/form-value.model';
import { BullMasterService } from '../bull-master.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTab } from '@angular/material/tabs';

export interface IDialogData {
  bullId: string;
  sireId?: string;
  damId?: string;
  sireSireId?: string;
  sireDamId?: string;
  damSireId?: string;
  damDamId?: string;
}
@Component({
  selector: 'app-additional-details-dialog',
  templateUrl: './additional-details-dialog.component.html',
  styleUrls: ['./additional-details-dialog.component.css'],
})
export class AdditionalDetailsDialogComponent implements OnInit {
  isLoadingSpinner = false;
  tabs = [
    'Bull/Semen Details',
    'Sire Details',
    'Dam Details',
    "Sire's Sire Details",
    "Sire's Dam Details",
    "Dam's Sire Details",
    "Dam's Dam Details",
  ];
  submitStatus = new Array<boolean>(this.tabs.length).fill(false);
  step = 0;
  form: FormGroup;
  currentTab = 0;

  @ViewChild('dialogBody') dialogBody: ElementRef<HTMLDivElement>;
  @ViewChildren(MatTab) matTabs: QueryList<MatTab>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: IDialogData,
    private dialogRef: MatDialogRef<AdditionalDetailsDialogComponent>,
    private fb: FormBuilder,
    private bullMasterService: BullMasterService,
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.form = this.fb.group({
      dateGroup: this.fb.group({
        childId: this.fb.control({
          value: this.data.bullId,
          disabled: true,
        }),
        parentId: this.fb.control({
          value: this.data.sireId,
          disabled: true,
        }),
        estimationDate: this.fb.control(moment()),
        noOfDaughters: this.fb.control(null),
        noOfHerdPerVillage: this.fb.control(null),
      }),
      parameters: this.fb.group({
        stature: [],
        statureBreeding: [],
        statureReliability: [],
        chestWidth: [],
        chestWidthBreeding: [],
        chestWidthReliability: [],
        bodyDepth: [],
        bodyDepthBreeding: [],
        bodyDepthReliability: [],
        angularity: [],
        angularityBreeding: [],
        angularityReliability: [],
        rumpAngle: [],
        rumpAngleBreeding: [],
        rumpAngleReliability: [],
        rumpWidth: [],
        rumpWidthBreeding: [],
        rumpWidthReliability: [],
        rearLegsSet: [],
        rearLegsSetBreeding: [],
        rearLegsSetReliability: [],
        rearLegsRearView: [],
        rearLegsRearViewBreeding: [],
        rearLegsRearViewReliability: [],
        footAngle: [],
        footAngleBreeding: [],
        footAngleReliability: [],
        foreUdderAttachment: [],
        foreUdderAttachmentBreeding: [],
        foreUdderAttachmentReliability: [],
        rearUdderAttachment: [],
        rearUdderAttachmentBreeding: [],
        rearUdderAttachmentReliability: [],
        rearUdderHeight: [],
        rearUdderHeightBreeding: [],
        rearUdderHeightReliability: [],
        centralLigament: [],
        centralLigamentBreeding: [],
        centralLigamentReliability: [],
        udderDepth: [],
        udderDepthBreeding: [],
        udderDepthReliability: [],
        teatPlacementRearView: [],
        teatPlacementRearViewBreeding: [],
        teatPlacementRearViewReliability: [],
        teatLength: [],
        teatLengthBreeding: [],
        teatLengthReliability: [],
      }),
    });
  }

  setStep(step: number) {
    this.step = step;
  }

  saveTab() {
    switch (this.currentTab) {
      case 0:
        this.saveBullSemenDetails(
          <FormGroup>this.form.get('semenDetails'),
          <FormGroup>this.form.get('parameters'),
          this.currentTab
        );
        break;
      case 1:
        this.saveSireDetails(
          <FormGroup>this.form.get('sireDetails'),
          this.currentTab
        );
        break;
      case 2:
        this.saveDamDetails(
          <FormGroup>this.form.get('damDetails'),
          this.currentTab
        );
        break;
      case 3:
        this.saveSireDetails(
          <FormGroup>this.form.get('sireSireDetails'),
          this.currentTab
        );
        break;
      case 4:
        this.saveDamDetails(
          <FormGroup>this.form.get('sireDamDetails'),
          this.currentTab
        );
        break;
      case 5:
        this.saveSireDetails(
          <FormGroup>this.form.get('damSireDetails'),
          this.currentTab
        );
        break;
      case 6:
        this.saveDamDetails(
          <FormGroup>this.form.get('damDamDetails'),
          this.currentTab
        );
        break;
    }
  }

  saveBullSemenDetails(
    bullSemenDetails: FormGroup,
    parameters: FormGroup,
    tab: number
  ) {
    if (bullSemenDetails.invalid || parameters.invalid) {
      bullSemenDetails.markAllAsTouched();
      parameters.markAllAsTouched();
      return;
    }

    const reqObj: AdditionalDetailsFormObj['semenDetails'] &
      AdditionalDetailsFormObj['parameters'][0] &
      AdditionalDetailsFormObj['dateGroup'] = {
      ...bullSemenDetails.getRawValue(),
      ...parameters.getRawValue(),
      ...this.form.getRawValue().dateGroup,
      bullId: this.form.getRawValue().dateGroup.childId,
    };
    reqObj.estimationDate = this.formatDate(reqObj.estimationDate);

    delete reqObj['parentId'];
    delete reqObj['childId'];

    this.isLoadingSpinner = true;
    this.bullMasterService
      .bullSemenDetails(reqObj)
      .subscribe(this.handleSave, () => (this.isLoadingSpinner = false));
  }

  saveSireDetails(form: FormGroup, tab: number) {
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }
    const formValue = form.value as AdditionalDetailsFormObj['sireDetails'];
    const reqObj = {
      ...formValue,
      ...this.form.value.dateGroup,
      bullId: this.form.getRawValue()?.dateGroup?.childId,
      sireId: this.form.getRawValue()?.dateGroup?.parentId,
    };
    reqObj.estimationDate = this.formatDate(reqObj.estimationDate);

    delete reqObj.dateGroup;
    delete reqObj['parentId'];
    delete reqObj['childId'];

    this.isLoadingSpinner = true;
    this.bullMasterService
      .bullSireDetails(reqObj)
      .subscribe(this.handleSave, () => (this.isLoadingSpinner = false));
  }

  saveDamDetails(form: FormGroup, tab: number) {
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }
    const formValue =
      form.getRawValue() as AdditionalDetailsFormObj['damDetails'];

    const lactations = [];
    const breedingValue = {};
    for (let i = 0; i < formValue.fatPercentage.lactations.length; i++) {
      const lact = {};
      Object.entries(formValue).forEach(([key, value]) => {
        if (key !== 'dateGroup') {
          lact[key] = value.lactations[i];
          breedingValue[key] = value.breedingValue;
        }
      });
      lactations.push(lact);
    }
    const reqObj = {
      lactations,
      breedingValue,
      ...this.form.value.dateGroup,
      bullId: this.form.getRawValue()?.dateGroup?.childId,
      damId: this.form.getRawValue()?.dateGroup?.parentId,
    };
    reqObj.estimationDate = this.formatDate(reqObj.estimationDate);
    delete reqObj.sireId;

    this.isLoadingSpinner = true;
    this.bullMasterService
      .bullDamDetails(reqObj)
      .subscribe(this.handleSave, () => (this.isLoadingSpinner = false));
  }

  formatDate(date: Date | string) {
    return moment(date).format('YYYY-MM-DD');
  }

  onPanelExpand() {
    this.dialogBody.nativeElement.scrollTo({
      behavior: 'smooth',
      top: 0,
    });
  }

  get dateGroup() {
    return this.form.get('dateGroup') as FormGroup;
  }

  skipTab() {
    this.currentTab = this.nextActiveTabIndex();

    this.dialogBody.nativeElement.scrollTo({
      behavior: 'smooth',
      top: 0,
    });
  }

  changeTab(tab: number) {
    switch (tab) {
      // bull semen details
      case 0:
        this.dateGroup.patchValue({
          childId: this.data.bullId,
          parentId: this.data.sireId,
        });
        break;

      // sire details
      case 1:
        this.dateGroup.patchValue({
          childId: this.data.bullId,
          parentId: this.data.sireId,
        });
        break;

      // dam details
      case 2:
        this.dateGroup.patchValue({
          childId: this.data.bullId,
          parentId: this.data.damId,
        });
        break;

      // sire sire details
      case 3:
        this.dateGroup.patchValue({
          childId: this.data.sireId,
          parentId: this.data.sireSireId,
        });
        break;

      // sire dam details
      case 4:
        this.dateGroup.patchValue({
          childId: this.data.sireId,
          parentId: this.data.sireDamId,
        });
        break;

      // dam sire details
      case 5:
        this.dateGroup.patchValue({
          childId: this.data.damId,
          parentId: this.data.damSireId,
        });
        break;

      // dam dam details
      case 6:
        this.dateGroup.patchValue({
          childId: this.data.damId,
          parentId: this.data.damDamId,
        });
        break;
      default:
        break;
    }
  }

  handleSave(res: any) {
    this.isLoadingSpinner = false;
    this.submitStatus[this.currentTab] = true;
    if(this.nextActiveTabIndex() === -1) {
      this.dialogRef.close(true)
    }
    this.currentTab = this.nextActiveTabIndex();
    
    this.dialogBody.nativeElement.scrollTo({
      behavior: 'smooth',
      top: 0,
    });
  }

  nextActiveTabIndex() {
    return this.matTabs
      ?.toArray()
      .findIndex(
        (tab, tabIndex) => !tab.disabled && tabIndex > this.currentTab
      );
  }

  get showSkipButton() {
    return this.nextActiveTabIndex() !== -1;
  }
}
