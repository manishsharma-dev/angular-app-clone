import { TranslatePipe } from '@ngx-translate/core';
import { AnimalManagementConfig } from './../../../../../shared/animal-management.config';
import { AnimalManagementService } from './../../animal-management.service';
import { UserService } from 'src/app/shared/user/user.service';
import { CommonData } from './../../../owner-registration/models-owner-reg/common-data.model';
import {
  Component,
  ElementRef,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { OtpDialogComponent } from '../../../../../shared/otp-dialog/otp-dialog.component';
import {
  EartagValidation,
  getFileSize,
  NameValidation,
  NumericValidation,
} from '../../../../../shared/utility/validation';
import { DatePipe, Location } from '@angular/common';
import { OwnerDetailsService } from '../../../owner-registration/owner-details.service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { AnimalDetailService } from '../animal-detail.service';
import { existingEarTagValidator } from '../../../../../shared/utility/directives/unique-email.directive';
import { CompleteOwnerDetails } from '../../../owner-registration/models-owner-reg/get-ownerby-ownerID.model';
import { AppService } from 'src/app/shared/shareService/app.service';
import { Router } from '@angular/router';
import moment from 'moment';

interface PregMonths {
  cd: number;
  value: number;
}
@Component({
  selector: 'app-animal-detail',
  templateUrl: './animal-detail.component.html',
  styleUrls: ['./animal-detail.component.css'],
  providers: [DatePipe, TranslatePipe],
  encapsulation: ViewEncapsulation.None,
})
export class AnimalDetailComponent implements OnInit {
  dateString: string = '';
  displayYear: number = 0;
  displayMonths: number = 0;
  animalInfoFormGroup!: FormGroup;
  species: CommonData[] = [];
  dateToday: Date;
  registrationDateToday: string = '';
  datePrevious: string = '';
  minDobLimit: string = '';
  animalPic: string = '';
  isPhoto: boolean = false;
  uploadSuccess: boolean = false;
  calculatedDate: string = '';
  ageInMonths: number = 0;
  selectedMonth: string = '';
  selectedYear: string = '';
  showPregError: string = '';
  uploadedFileError: string = '';
  ownerData!: CompleteOwnerDetails;
  ownerName: string = '';
  selectedFile: File = {} as File;
  isLoadingSpinner: boolean = false;
  pregMonths: Array<PregMonths> = [];
  animalDOBLimit = AnimalManagementConfig.animalDOBLimit;
  minAgeForPregnancy = AnimalManagementConfig.minAgeForPregnancy;
  taggingDateLimit = AnimalManagementConfig.taggingDateLimit;
  tagDateLimit = '';

  constructor(
    public dialog: MatDialog,
    private datePipe: DatePipe,
    private ownerDS: OwnerDetailsService,
    private animalDS: AnimalDetailService,
    private animalMS: AnimalManagementService,
    private userService: UserService,
    private location: Location,
    private el: ElementRef,
    private transPipe: TranslatePipe,
    private appService: AppService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setConfigValue();
    this.getCurrentDate();
    this.fetchSpecies();
    this.ownerData = JSON.parse(sessionStorage.getItem('ownerData') || '');
    this.setOwnerName();
    this.animalInfoFormGroup = new FormGroup({
      ownerId: this.ownerData?.ownerId
        ? new FormControl(this.ownerData?.ownerId)
        : new FormControl(this.ownerData?.orgId),
      tagId: new FormControl(
        '',
        [Validators.required, EartagValidation],
        [existingEarTagValidator(this.userService)]
      ),
      registrationDate: new FormControl({
        value: this.dateToday,
        disabled: true,
      }),
      taggingDate: new FormControl(this.dateToday, Validators.required),
      animalName: new FormControl('', NameValidation),
      speciesCd: new FormControl('', Validators.required),
      sex: new FormControl('', Validators.required),
      dateOfBirth: new FormControl('', Validators.required),
      selectedYear: new FormControl(this.displayYear, [NumericValidation]),
      selectedMonth: new FormControl(this.displayMonths),
      animalPic: new FormControl('', {
        validators: [Validators.required],
      }),
      pregnancyStatus: new FormControl('N', Validators.required),
      pregnancyMonth: new FormControl(''),
    });
    this.pregMonthsValidation();
  }

  getCurrentDate() {
    this.isLoadingSpinner = true;
    this.animalMS.getCurrentDate().subscribe(
      (date) => {
        this.dateToday = new Date(date.value);
        this.registrationDateToday = date.value;
        this.animalInfoFormGroup.patchValue({
          registrationDate: this.dateToday,
          taggingDate: this.dateToday,
        });
        this.animalInfoFormGroup.updateValueAndValidity();
        this.isLoadingSpinner = false;
        this.getPastTaggingDate(+this.taggingDateLimit.defaultValue);
        this.getPastDate(+this.animalDOBLimit?.defaultValue * 12);
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  setConfigValue() {
    this.animalDOBLimit = AnimalManagementConfig.animalDOBLimit;
    this.minAgeForPregnancy = AnimalManagementConfig.minAgeForPregnancy;
    this.taggingDateLimit = AnimalManagementConfig.taggingDateLimit;
  }

  pregMonthsValidation() {
    this.animalInfoFormGroup
      .get('pregnancyStatus')
      .valueChanges.subscribe((val) => {
        if (val == 'Y') {
          this.animalInfoFormGroup
            .get('pregnancyMonth')
            .addValidators(Validators.required);
        } else {
          this.animalInfoFormGroup.get('pregnancyMonth').clearValidators();
        }
        this.animalInfoFormGroup.get('pregnancyMonth').updateValueAndValidity();
      });
  }

  openOtpDialog(animalId: string) {
    this.animalDS.setOwnerData(this.ownerData);
    this.animalDS.setAnimalRegFlag(true);
    const dialogRef = this.dialog.open(OtpDialogComponent, {
      data: {
        ownerId: this.ownerData.ownerId
          ? this.ownerData.ownerId
          : this.ownerData.orgId,
        header:
          this.transPipe.transform(
            'animalDetails.previewAnimalDetails.reg_date'
          ) +
          moment(this.animalInfo.registrationDate.value).format('DD/MM/YYYY'),
        heading: this.transPipe.transform(
          'animalDetails.previewAnimalDetails.animal_registered'
        ),
        tagid:
          this.transPipe.transform('animalDetails.previewAnimalDetails.tagId') +
          ' ' +
          this.animalInfo.tagId.value,
        message:
          this.transPipe.transform(
            'animalDetails.previewAnimalDetails.successfully_added_to'
          ) +
          ' ' +
          (this.ownerData.ownerName
            ? this.ownerData.ownerName
            : this.ownerData.orgName) +
          ' ' +
          this.transPipe.transform(
            'animalDetails.previewAnimalDetails.account'
          ),
        link: '/dashboard/animal/animalsearch',
        otp: '4321',
        animalId: animalId,
        ownerMobileNo: this.ownerData.ownerMobileNo
          ? String(this.ownerData?.ownerMobileNo)
          : String(this.ownerData.orgMobileNo),
      },
      width: '500px',
    });
    dialogRef.afterClosed().subscribe((res) => {});
    var month = this.ageInMonths % 12;
    var year = Math.floor(this.ageInMonths / 12);
    this.animalInfoFormGroup.patchValue({
      selectedYear: year,
      selectedMonth: month,
    });
  }

  get animalInfo() {
    return this.animalInfoFormGroup.controls;
  }

  setOwnerName() {
    this.ownerName = this.ownerData?.ownerName;
  }

  redirectToAnimalReg() {
    // const lastNav = this.route.;
    // const previousRoute = lastNav.previousNavigation;
    // this.route.navigateByUrl(previousRoute);
    this.location.back();
    // this.route.navigateByUrl('/dashboard/animal/animalsearch');
    this.animalDS.setParentComponent('animalReg');
  }

  getPastDate(month: number): string {
    var tempDate = new Date(this.dateToday);
    tempDate.setMonth(tempDate.getMonth() - month);
    this.minDobLimit = tempDate.toISOString().split('T')[0];
    this.minDobLimit = tempDate.toISOString().split('T')[0];
    return this.minDobLimit;
  }

  getPastTaggingDate(days: number): string {
    var tempDate = new Date(this.dateToday);
    tempDate.setDate(tempDate.getDate() - days);
    this.tagDateLimit = tempDate.toISOString().split('T')[0];
    return this.tagDateLimit;
  }

  onTaggingDateChange(tagDate: MatDatepickerInputEvent<Date>) {
    if (
      this.animalInfoFormGroup.controls['taggingDate'].value >
      this.animalInfoFormGroup.controls['dateOfBirth'].value
    ) {
      let dobVal = this.animalInfoFormGroup.get('dateOfBirth').value;
      if (dobVal) {
        dobVal = moment(dobVal).format('YYYY-MM-DD');
      }
      if (dobVal) {
        this.getAge(dobVal);
      }
    }
    // let tagDate = dob.target?.value;
    // if (this.ageInMonths > 0) {
    //   let date = new Date(tagDate);
    //   date.setMonth(date.getMonth() - this.ageInMonths);
    //   this.animalInfoFormGroup.patchValue({ dateOfBirth: date });
    // }
    // this.animalInfoFormGroup.patchValue({
    //   selectedMonth: '',
    //   selectedYear: '',
    //   dateOfBirth: '',
    // });
  }

  getDobByAge(month: number, year: number): string {
    let crrDate = new Date(this.animalInfoFormGroup.get('taggingDate').value);
    crrDate.setFullYear(crrDate.getFullYear() - year);
    crrDate.setMonth(crrDate.getMonth() - month);
    this.animalInfoFormGroup.controls['dateOfBirth'].setValue(crrDate);
    this.calculatedDate = crrDate.toISOString().split('T')[0];
    this.getAge(this.calculatedDate);
    this.animalInfoFormGroup.patchValue({ pregnancyMonth: '' });
    this.showPregError = '';
    return this.calculatedDate;
  }

  getAge(dateString: string) {
    var now = new Date(this.animalInfoFormGroup.get('taggingDate').value);
    var yearNow = now.getFullYear();
    var monthNow = now.getMonth() + 1;
    var dateNow = now.getDate();
    var dob = new Date(
      parseInt(dateString.substring(0, 4)),
      parseInt(dateString.substring(5, 7)) - 1,
      parseInt(dateString.substring(8, 10))
    );
    var yearDob = dob.getFullYear();
    var monthDob = dob.getMonth() + 1;
    var dateDob = dob.getDate();
    var ageString = '';
    var yearString = '';
    var monthString = '';
    var dayString = '';
    let yearAge = yearNow - yearDob;
    if (monthNow >= monthDob) var monthAge = monthNow - monthDob;
    else {
      yearAge--;
      var monthAge = 12 + monthNow - monthDob;
    }
    if (dateNow >= dateDob) var dateAge = dateNow - dateDob;
    else {
      monthAge--;
      var dateAge = 31 + dateNow - dateDob;
      if (monthAge < 0) {
        monthAge = 11;
        yearAge--;
      }
    }
    let ages = {
      years: yearAge,
      months: monthAge,
      days: dateAge,
    };
    if (ages.years > 1) yearString = ' years';
    else yearString = ' year';
    if (ages.months > 1) monthString = ' months';
    else monthString = ' month';
    if (ages.days > 1) dayString = ' days';
    else dayString = ' day';
    if (ages.years > -1) {
      this.displayYear = ages.years;
      this.displayMonths = ages.months;
      this.animalInfoFormGroup.get('selectedYear').setValue(ages.years);
      this.animalInfoFormGroup.get('selectedMonth').setValue(ages.months);
      this.ageInMonths = this.displayYear * 12 + this.displayMonths;
    }
    return ageString;
  }

  sendDate(dob: MatDatepickerInputEvent<Date>) {
    var date = moment(dob.target?.value).format('YYYY-MM-DD');
    if (date) {
      this.getAge(date);
    }
  }

  fetchSpecies() {
    this.ownerDS
      .getCommonData('species')
      .subscribe((speciesList: CommonData[]) => {
        this.species = speciesList;
      });
  }

  onFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];
    this.selectedFile = (event.target as HTMLInputElement)?.files![0];
    this.animalInfoFormGroup.patchValue({ animalPic: this.selectedFile });
    this.animalInfoFormGroup.patchValue({
      description: file.name.split('.')[0],
    });
    this.isLoadingSpinner = true;
    let data = getFileSize(file);
    if (!data) {
      this.uploadedFileError = this.transPipe.transform(
        'common.image_size_exceed'
      );
      this.isLoadingSpinner = false;
      return;
    }
    this.animalMS.validateFile(this.selectedFile).subscribe(
      (isValid) => {
        this.isLoadingSpinner = false;
        this.uploadedFileError = isValid
          ? ''
          : this.transPipe.transform('common.image_size');
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
    this.animalInfoFormGroup.get('animalPic')?.updateValueAndValidity();
  }

  onSelectingPregMonth(month: Event) {
    if (this.ageInMonths - +(month.target as HTMLInputElement)?.value < 9) {
      var errMsg = String(this.ageInMonths - 9);
      this.showPregError =
        "Pregnancy Month can't be greater than " + errMsg + ' months';
    } else {
      this.showPregError = '';
    }
  }

  getMaxPregMonth(event: Event) {
    this.animalInfoFormGroup.patchValue({
      pregnancyMonth: '',
    });
    this.animalDS
      .getPregMonthAccToSpecies((event.target as HTMLInputElement).value)
      .subscribe((data) => {
        this.pregMonths = [];
        let crrMonth = 1;
        while (crrMonth <= data.maxPregnancyMonths) {
          this.pregMonths.push({ cd: crrMonth, value: crrMonth++ });
        }
      });
  }

  checkPregnancyValidation(): boolean {
    if (
      this.animalInfoFormGroup.controls.sex.value == 'F' &&
      this.ageInMonths >= +this.minAgeForPregnancy?.defaultValue
    ) {
      return true;
    } else {
      this.animalInfoFormGroup.patchValue({ pregnancyStatus: 'N' });
      return false;
    }
  }

  onSelectingGender() {
    this.animalInfoFormGroup.patchValue({ pregnancyMonth: '' });
  }

  validateForm() {
    const formValue = this.animalInfoFormGroup.value;
    formValue.dateOfBirth = moment(formValue.dateOfBirth).format('YYYY-MM-DD');
    formValue.taggingDate = moment(formValue.taggingDate).format('YYYY-MM-DD');
    formValue.registrationDate = moment(formValue.registrationDate).format(
      'YYYY-MM-DD'
    );
    if (
      !this.animalInfoFormGroup.valid ||
      this.showPregError ||
      this.uploadedFileError
    ) {
      this.animalInfoFormGroup.markAllAsTouched();
      const controls = this.animalInfoFormGroup.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          const invalidControl = this.el.nativeElement.querySelector(
            '[formcontrolname="' + name + '"]'
          );
          invalidControl?.focus();
        }
      }
      return;
    } else {
      var formData: any = new FormData();
      formData.append('animalName', formValue.animalName);
      formData.append('animalPic', formValue.animalPic);
      formData.append('dateOfBirth', formValue.dateOfBirth);
      formData.append('ownerId', formValue.ownerId);
      formData.append('pregnancyMonth', formValue.pregnancyMonth);
      formData.append('pregnancyStatus', formValue.pregnancyStatus);
      formData.append('selectedMonth', formValue.selectedMonth);
      // formData.append('selectedYear', formValue.selectedYear);
      formData.append('sex', formValue.sex);
      formData.append('speciesCd', formValue.speciesCd);
      formData.append('tagId', formValue.tagId);
      formData.append('taggingDate', formValue.taggingDate);
      formData.append('registrationDate', this.registrationDateToday);
      // for (let ob in this.locationInfoObj) {
      //   formData.append(ob, this.locationInfoObj[ob]);
      // }
      this.appService.getModulebyUrl('/animal/animalsearch');
      this.isLoadingSpinner = true;
      this.animalDS.registerAnimal(formData).subscribe(
        (data) => {
          this.isLoadingSpinner = false;
          this.openOtpDialog(String(data.animalId));
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
    }
  }

  resetForm() {
    const resetValue = document.getElementById('animalPic') as HTMLFormElement;
    resetValue.value = '';
    this.uploadedFileError = '';
    this.animalInfoFormGroup.reset({
      speciesCd: '',
      selectedMonth: '',
      animalName: '',
      taggingDate: this.dateToday,
      registrationDate: this.dateToday,
      pregnancyMonth: '',
      animalPic: '',
      ownerId: this.ownerData?.ownerId
        ? this.ownerData?.ownerId
        : this.ownerData?.orgId,
    });
  }
}
