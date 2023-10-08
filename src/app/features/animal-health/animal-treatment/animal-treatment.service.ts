import { CommonRes } from './../models/common-res.model';
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import moment from 'moment';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CommonMaster } from './models/common-master.model';
import { Disease } from './models/disease.model';
import { ErrorResponse } from './models/error-response.model';
import {
  LabMaster,
  Medicine,
  OrganAffected,
  SampleExaminationType,
  SampleStatusFlag,
  SampleType,
  SpotTestMaster,
  suggestedMedicineModel,
  Surgery,
} from './models/master.model';
import { NewCaseResponse } from './models/new-case-response.model';
import { OpenTreatmentCasesResponse } from './models/open-treatment-response.model';
import { PrescriptionRes } from './models/prescription.model';
import { Symptom } from './models/symptom.model';
import { TreatmentHistory } from './models/treatment-history.model';
import { Unit } from './models/unit.model';
import {
  getDecryptedProjectData,
  getDecryptedRoleData,
  getSessionData,
} from 'src/app/shared/shareService/storageData';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AnimalTreatmentService {
  private readonly apiUrl = environment.apiURL + 'animalhealthtreatment';

  private readonly apiMasterUrl = environment.apiURL + 'animalhealthtreatment';

  private readonly apiDownloadUrl =
    environment.apiURL + 'animalhealthtreatment';
  private readonly apiUrlAnimalHealth =
    environment.apiURL + 'animalhealthtestingsamples';

  private http1: HttpClient;

  private readonly apiUrlHealthMgmt = environment.apiURL + 'animalhealth/';
  constructor(
    private http: HttpClient,
    private handler: HttpBackend,
    private authService: AuthService
  ) {
    this.http1 = new HttpClient(handler);
  }

  getRouteMaster() {
    return this.http.get<Unit[]>(this.apiUrlHealthMgmt + 'getRouteMaster');
  }

  // Unit Master Api
  getMeasurementUnitMaster() {
    return this.http.get<Unit[]>(
      this.apiMasterUrl + '/getMeasurementUnitMaster'
    );
  }

  // Symptoms & Disease APIs
  getSymptomsMaster() {
    return this.http.get<Symptom[]>(this.apiMasterUrl + '/getSymptomMaster');
  }

  getDiseasesMaster() {
    return this.http.get<Disease[]>(this.apiMasterUrl + '/getDiseaseMaster');
  }

  getSymptoms() {
    return this.http.get<Symptom[]>(this.apiUrl + '/getSymptoms');
  }

  getDiseaseFromSymptoms(
    symptomsCodes: {
      symptomCd: number;
    }[]
  ) {
    return this.http.post<Disease[]>(
      this.apiUrl + '/getDiseases',
      symptomsCodes
    );
  }

  // Symptoms & Disease APIs

  /** Medicine APIs **/

  getSuggestedMedicine(request: any): Observable<suggestedMedicineModel[]> {
    return this.http.post<suggestedMedicineModel[]>(
      this.apiUrl + '/getSuggestedMedicine',
      request
    );
  }

  getMedicinebySearch(request: any): Observable<any[]> {
    return this.http.post<any[]>(this.apiUrl + '/getMedicineSaltName', request);
  }

  getMedicineMaster() {
    return this.http.get<Medicine[]>(
      this.apiUrlHealthMgmt + 'getMedicineMaster'
    );
  }

  /** Medicine APIs **/

  /** Diagnostics APIs */

  getSampleTypeMaster(status_flags: SampleStatusFlag[]) {
    return this.http.post<SampleType[]>(
      this.apiUrlAnimalHealth + '/getSampleTypeMaster',
      { status_flags }
    );
  }

  getExaminationTypeMaster() {
    return this.http.get<SampleExaminationType[]>(
      this.apiUrlAnimalHealth + '/getSampleExaminationTypeMaster'
    );
  }

  getSubExaminationTypeMaster(request: any) {
    return this.http.post(
      this.apiUrlAnimalHealth + '/getSampleExaminationSubtypeMaster',
      request
    );
  }

  getOnSpotTestMaster() {
    return this.http.get<SpotTestMaster[]>(
      this.apiUrlAnimalHealth + '/getOnSpotTestMaster'
    );
  }

  getOnSpotDiseaseSuspected() {
    return this.http.get<Disease[]>(
      this.apiUrlAnimalHealth + '/getOnSpotDiseaseSuspected'
    );
  }

  /** Diagnostics APIs */

  // Follow Up API
  getOpenTreatmentCases(tagId: number) {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(
      'Authorization',
      `Bearer ${sessionStorage.getItem('token')}`
    );
    headers = headers.append(
      'roleCd',
      getDecryptedRoleData('AESSHA256userDataRole').id || ''
    );
    headers = headers.append(
      'projectId',
      getDecryptedProjectData('AESSHA256storageProjectData').id || ''
    );
    headers = headers.append(
      'subModuleCd',
      getSessionData('subModuleCd')?.subModuleCd.toString()
    );
    headers = headers.append(
      'langCd',
      getSessionData('language') ? getSessionData('language').toString() : ''
    );
    return this.http1.post<CommonRes<OpenTreatmentCasesResponse[]>>(
      this.apiUrl + '/getOpenTreatmentCases',
      {
        tagId,
      },
      { headers }
    );
  }

  // Add Follow UP
  getTreatmentDetails(caseId: number | null, followUpNo: number | null) {
    return this.http
      .post<TreatmentHistory>(this.apiUrl + '/getTreatmentDetails', {
        caseId,
        followUpNo,
      })
      .pipe();
  }

  // Add new case
  registerNewCase(caseDetails: any) {
    return this.http.post<NewCaseResponse>(
      this.apiUrl + '/registerNewCase',
      caseDetails
    );
  }

  // Follow Up case
  saveFollowupVisitDetails(caseDetails: any) {
    return this.http.post<NewCaseResponse>(
      this.apiUrl + '/saveFollowupVisitDetails',
      caseDetails
    );
  }

  //Save Diagnostics Data

  saveSampleData(request: any) {
    return this.http.post(
      this.apiUrlAnimalHealth + '/saveSampleDetails',
      request
    );
  }

  updateLabSamples(request: any) {
    return this.http.put(
      this.apiUrlAnimalHealth + '/updateSampleDetails',
      request
    );
  }

  //Save RadioLogy Data

  saveRadiologyData(request: any) {
    return this.http.post(this.apiUrl + '/saveRadiologyDetails', request);
  }

  saveRadiologyDataT(request: any) {
    return this.http.post(this.apiUrl + '/saveRadiologyDetails', request);
  }

  // Prescription APIs
  viewPrescription(caseId: number, followUpNo: number) {
    return this.http.post<PrescriptionRes | ErrorResponse>(
      this.apiUrl + '/viewPrescription',
      {
        caseId,
        followUpNo,
      }
    );
  }

  // viewPrescriptionMedicineDetails(caseId: number, followUpNo: number) {
  //   return this.http.post<PrescriptionMedicineDetails[]>(
  //     this.apiUrl + '/viewPrescriptionMedicineDetails',
  //     {
  //       caseId,
  //       followUpNo,
  //     }
  //   );
  // }

  // viewPrescriptionSampleDetails(caseId: number, followUpNo: number) {
  //   return this.http.post<PrescriptionSampleDetails[]>(
  //     this.apiUrl + '/viewPrescriptionSampleDetails',
  //     {
  //       caseId,
  //       followUpNo,
  //     }
  //   );
  // }

  downloadPrescription(req: { caseId: number; followUpNo: number }) {
    const requestOptions: Object = {
      observe: 'response',
      responseType: 'blob' as 'json',
    };
    return this.http.post<string>(
      this.apiDownloadUrl + '/viewDownloadPrescription',
      req,
      requestOptions
    );
  }
  // Prescription APIs

  // Surgery APIs
  getSurgeryTypeMaster() {
    return this.http.get<Surgery[]>(
      this.apiMasterUrl + '/getSurgeryTypeMaster'
    );
  }

  getOrganAffected(surgeryCodes: { surgeryTypeCd: number }[]) {
    return this.http.post<OrganAffected[]>(
      this.apiMasterUrl + '/getOrganAffected',
      surgeryCodes
    );
  }

  getWords(monthCount: any) {
    function getPlural(number: any, word: any) {
      return (number === 1 && word.one) || word.other;
    }

    var months = { one: 'M', other: 'M' },
      years = { one: 'Y', other: 'Y' },
      m = monthCount % 12,
      y = Math.floor(monthCount / 12),
      result = [];

    y && result.push(y + '' + getPlural(y, years));
    m && result.push(m + '' + getPlural(m, months));
    return result.join(' ');
  }

  getDifferenceDate(date1, date2) {
    const diffTime = Math.abs(date2 - date1);
    return moment(date1).diff(moment(date2), 'd');
    // return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // if (Math.ceil(diffTime / (1000 * 60 * 60 * 24)) < 1) {
    //   return true;
    // }
    // return false;
  }

  convertToCelcius(value) {
    if (value) {
      return ((+value - 32) * 5) / 9;
    } else return null;
  }
}
