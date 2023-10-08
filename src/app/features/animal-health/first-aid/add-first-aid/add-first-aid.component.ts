import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import { AnimalDetailService } from 'src/app/features/animal-management/animal-registration/animal-details/animal-detail.service';
import { AnimalDetails } from 'src/app/features/animal-management/animal-registration/models-animal-reg/animal-details.model';
import {
  AlphaNumericSpecialValidation,
  AlphaNumericValidation,
  onlyNumberValidation,
} from 'src/app/shared/utility/validation';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { ErrorResponse } from '../../animal-treatment/models/error-response.model';
import { CaseIDDialogComponent } from '../case-id-dialog/case-id-dialog.component';
import { FirstAidService } from '../first-aid.service';
import { CaseStatus } from '../models/caseStatus.model';
import { MinorAilment } from '../models/minor-ailment.model';
import { SaveFirstAid } from '../models/saveFirstAidDetails.model';

@Component({
  selector: 'app-add-first-aid',
  templateUrl: './add-first-aid.component.html',
  styleUrls: ['./add-first-aid.component.css'],
  providers: [TranslatePipe],
})
export class AddFirstAidComponent implements OnInit {
  isLoadingSpinner: boolean = false;
  firstAidForm: FormGroup;
  submitted = false;
  validationMsg = animalHealthValidations.firstAid;
  minor_ailment: MinorAilment[] = [];
  animalIdOnSelect: string;
  animalDetails: AnimalDetails[] = [];
  TagID: number;
  Species: string;
  Sex: string;
  ownerID: number;
  case_status: CaseStatus[] = [];
  response_total: SaveFirstAid[] = [];
  Successmessage: SaveFirstAid[] = [];
  caseID: SaveFirstAid[] = [];
  supervisorName: SaveFirstAid[] = [];
  public isShowError: string = '';
  serverCurrentDateTime = sessionStorage.getItem('serverCurrentDateTime');
  constructor(
    private _location: Location,
    public dialog: MatDialog,
    private animalMgmtService: AnimalDetailService,
    private formBuilder: FormBuilder,
    private router: Router,
    private firstAidService: FirstAidService,
    private location: Location,
    private route: ActivatedRoute,
    private translatePipe: TranslatePipe
  ) { }

  ngOnInit(): void {
    this.getAnimalDetails();
    this.caseStatus();

    this.firstAidForm = this.formBuilder.group({
      DateOfFA: [
        { value: moment(this.today).format('DD/MM/YYYY'), disabled: true },
        [Validators.required],
      ],
      ailmentCd: ['', Validators.required],
      firstAidTreatmentGiven: [
        '',
        [Validators.maxLength(80), AlphaNumericSpecialValidation],
      ],
      treatmentRemarks: [
        '',
        [
          Validators.required,
          Validators.maxLength(250),
          AlphaNumericSpecialValidation,
        ],
      ],
      paymentAmount: ['', [Validators.maxLength(4), onlyNumberValidation]],
      receiptNo: ['', [Validators.maxLength(10), AlphaNumericValidation]],
    });
  }
  caseStatus() {
    this.firstAidService.get_caseStatus('case_status').subscribe(
      (res: any[]) => {
        this.case_status = res;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  minorAilment() {
    this.firstAidService.get_Minor_Ailment('minor_ailment').subscribe(
      (res: any[]) => {
        if (this.Sex == 'F') {
          this.minor_ailment = res.filter((r) => r.cd != 7);
        } else {
          this.minor_ailment = res;
          this.ValidateCastration();
        }
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  getAnimalDetails() {
    this.animalIdOnSelect = JSON.parse(sessionStorage.getItem('animalID'));
    this.isLoadingSpinner = true;
    this.animalMgmtService.getAnimalDetails(this.animalIdOnSelect).subscribe(
      (res: any) => {
        this.animalDetails = res;
        this.TagID = res.tagId;
        this.Species = res.species;
        this.Sex = res.sex;
        this.ownerID = res.ownerDetails.ownerId ?? res.ownerDetails.orgId;
        this.minorAilment();
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }
  ValidateCastration() {
    if (this.animalIdOnSelect) {
      let castration = {
        animalId: this.animalIdOnSelect,
      };
      this.firstAidService
        .validateCastration(castration)
        .subscribe((res: any) => {
          if ((res as any as ErrorResponse).errorCode) {
            return;
          }
          if (res) {
            this.minor_ailment = this.minor_ailment.filter((r) => r.cd != 7);
          }
        });
    }
  }
  routeToAnimalTreatment() {
    this.router.navigate(['../../'], {
      relativeTo: this.route,
      queryParams: { ownerId: this.ownerID },
    });
  }

  get today() {
    return moment(this.serverCurrentDateTime).format('YYYY-MM-DD');
  }

  get f() {
    return this.firstAidForm.controls;
  }

  onSubmit(): void {
    const formattedDateFrom = this.firstAidForm.getRawValue().DateOfFA;
    // moment(this.firstAidForm.getRawValue().DateOfFA).format('YYYY-MM-DD') ==
    //   'Invalid date'
    //   ? ''
    //   : moment(this.firstAidForm.getRawValue().DateOfFA);

    if (this.firstAidForm.invalid || this.isShowError) {
      this.firstAidForm.markAllAsTouched();
      return;
    }
    let request = this.firstAidForm.value;
    request['treatmentRecordDate'] = this.today;
    request['treatmentDate'] = this.today;
    request['animalId'] = this.animalIdOnSelect;
    request['ownerId'] = this.ownerID;
    request['tagId'] = this.TagID;
    this.isLoadingSpinner = true;
    this.firstAidService.save_firstAid(request).subscribe(
      (res: any) => {
        this.response_total = res;
        this.Successmessage = res.msg.msgDesc;
        this.caseID = res.data.caseId;
        this.supervisorName = res.data.supervisorName;
        this.isLoadingSpinner = false;
        this.openDialog1();
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  openDialog1() {
    const dialogRef = this.dialog.open(CaseIDDialogComponent, {
      data: {
        title: this.Successmessage,
        message: this.translatePipe.transform(
          'errorMsg.treatment_payment_information_sent_to_the_farmer'
        ),
        caseID: this.caseID,
        supervisorName:this.supervisorName
      },
      width: '500px',
    });
    dialogRef.afterClosed().subscribe((res) => { });
  }

  clearWithoutField() {
    this.routeToAnimalTreatment();
  }
}
