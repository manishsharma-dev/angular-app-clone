import {
  HttpBackend,
  HttpClient,
  HttpEvent,
  HttpEventType,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { getSessionData } from 'src/app/shared/shareService/storageData';
import { environment } from 'src/environments/environment';
import { AnimalResult } from '../animal-management/animal-registration/models-animal-reg/tagId-search.model';
import { AuthService } from '../auth/auth.service';
import { CommonMaster } from './animal-treatment/models/common-master.model';
import { Disease } from './animal-treatment/models/disease.model';
import { ErrorResponse } from './animal-treatment/models/error-response.model';
import {
  LabMaster,
  SampleExaminationSubtypeMaster,
  SampleExaminationType,
  SampleStatusFlag,
  SampleType,
} from './animal-treatment/models/master.model';
import {
  FormValue,
  HealthHistoryComponent,
} from './components/health-history/health-history.component';
import { Config } from './deworming/models/config.model';
import { AnimalHistory } from './models/animal-history.model';
import { SaveInDraftResponse } from './post-mortem/models/saveInDraftResponse.model';
import { TreatmentResponseDialogComponent } from './treatment-response-dialog/treatment-response-dialog.component';
import { WithoutCamVillages } from './vaccination/models/campaign-village.model';
import { Campaign } from './vaccination/models/campaign.model';
import { StatusReport } from '../miscellaneous/status-report/models/status-report.model';
import moment from 'moment';
import { OwnerType } from 'src/app/shared/common-search-box/common-search-box.component';

export enum UploadStatus {
  progress,
  started,
  complete,
  idle,
}
const BACKEND_URL = environment.apiURL + 'animalhealth';
@Injectable({
  providedIn: 'root',
})
export class HealthService {
  private readonly commonApiUrl = environment.apiURL + 'commonutility';
  // private readonly tempUrl = environment.tempUrl + 'commonutility';
  private BACKEND_URL = environment.apiURL + 'animalhealth';
  private readonly adminApiUrl = environment.apiURL + 'admin/organization/';
  private readonly apiUrl = environment.apiURL + 'animalhealthtreatment';

  private readonly apiUrlAnimalHealth =
    environment.apiURL + 'animalhealthtestingsamples';

  private readonly apiMasterUrl = environment.apiURL + 'animalhealthtreatment';

  private readonly getDetailsByTagIdURL =
    environment.apiURL + 'animalmanagement/animal/getAnimalDetailsByTagId';

  private readonly dateUrl = environment.apiURL + 'animalmanagement/animal';

  private readonly animalApi = environment.apiURL;

  fileSizeUnit: number = 1024;
  private http1: HttpClient;
  constructor(
    private http: HttpClient,
    public dialog: MatDialog,
    private handler: HttpBackend,
    private authService: AuthService
  ) {
    this.http1 = new HttpClient(handler);
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

  isErrorResponse(res: any): res is ErrorResponse {
    return res.errorCode !== undefined;
  }

  getCommonMaster(key: string) {
    return this.http.post<CommonMaster[]>(
      this.commonApiUrl + '/getCommonMaster',
      {
        key,
      }
    );
  }

  getFileSize(fileSize: number): number {
    if (fileSize > 0) {
      if (fileSize < this.fileSizeUnit * this.fileSizeUnit) {
        fileSize = parseFloat((fileSize / this.fileSizeUnit).toFixed(2));
      } else if (
        fileSize <
        this.fileSizeUnit * this.fileSizeUnit * this.fileSizeUnit
      ) {
        fileSize = parseFloat(
          (fileSize / this.fileSizeUnit / this.fileSizeUnit).toFixed(2)
        );
      }
    }

    return fileSize;
  }

  getFileSizeUnit(fileSize: number) {
    let fileSizeInWords = 'bytes';

    if (fileSize > 0) {
      if (fileSize < this.fileSizeUnit) {
        fileSizeInWords = 'bytes';
      } else if (fileSize < this.fileSizeUnit * this.fileSizeUnit) {
        fileSizeInWords = 'KB';
      } else if (
        fileSize <
        this.fileSizeUnit * this.fileSizeUnit * this.fileSizeUnit
      ) {
        fileSizeInWords = 'MB';
      }
    }

    return fileSizeInWords;
  }

  uploadFile(fd: FormData) {
    return this.http
      .post(this.commonApiUrl + '/uploadFile', fd, {
        observe: 'events',
        reportProgress: true,
      })
      .pipe(
        map(
          (
            event: HttpEvent<{
              fileName: string;
              file: string;
            }>
          ) => {
            switch (event.type) {
              case HttpEventType.UploadProgress:
                const progress = Math.round(
                  (event.loaded / event.total!) * 100
                );
                return { status: UploadStatus.progress, progress, url: null };

              case HttpEventType.Sent:
                return { status: UploadStatus.started, progress: 0, url: null };

              case HttpEventType.Response:
                return {
                  status: UploadStatus.complete,
                  progress: 100,
                  url: event.body.file,
                };

              default:
                return { status: UploadStatus.idle, progress: 0, url: null };
            }
          }
        )
      );
  }

  public getVillagesbyUserID() {
    return this.http.post<WithoutCamVillages[]>(
      BACKEND_URL + '/getVillagesByUserId',
      {}
    );
  }

  getDefaultConfig(key: string) {
    return this.http.post<Config>(this.commonApiUrl + '/getConfigDetail', {
      key,
    });
  }

  getConfigDetails(keys: string[]) {
    return this.http.post<{ [key: string]: Config }[]>(
      this.commonApiUrl + `/getConfigDetails`,
      keys
    );
  }

  getDiseasesMaster() {
    return this.http.get<Disease[]>(this.apiMasterUrl + '/getDiseaseMaster');
  }

  /** Diagnostics APIs */

  getSampleTypeMaster(status_flags: SampleStatusFlag[]) {
    return this.http.post<SampleType[]>(
      this.apiUrlAnimalHealth + '/getSampleTypeMaster',
      { status_flags }
    );
  }

  getExaminationTypeMaster(sampleTypeCd: number) {
    return this.http.post<SampleExaminationType[]>(
      this.apiUrlAnimalHealth + '/getSampleExaminationTypeMaster',
      {
        sampleTypeCd,
      }
    );
  }

  getSubExaminationTypeMaster(sampleExaminationTypeCd: number) {
    return this.http.post<SampleExaminationSubtypeMaster[]>(
      this.apiUrlAnimalHealth + '/getSampleExaminationSubtypeMaster',
      { sampleExaminationTypeCd }
    );
  }

  getLabMaster() {
    return this.http.get<LabMaster[] | ErrorResponse>(
      this.apiUrl + '/getLabNameMaster'
    );
  }

  getDetailsByTagID(id: string) {
    let payload = new FormData();
    payload.append('TagId', id);
    return this.http.post<AnimalResult>(this.getDetailsByTagIdURL, payload);
  }

  getGroupByTagID(id: any) {
    return this.http.post(this.apiUrlAnimalHealth + '/getGroupsByTagId', {
      tagId: id,
    });
  }

  public getCampaignList(campaignType: number) {
    // let headers: HttpHeaders = new HttpHeaders();
    // headers = headers.append(
    //   'Authorization',
    //   `Bearer ${this.authService.getToken()}`
    // );
    // headers = headers.append(
    //   'roleCd',
    //   getDecryptedRoleData('AESSHA256userDataRole').id || ''
    // );
    // headers = headers.append(
    //   'projectId',
    //   getDecryptedProjectData('AESSHA256storageProjectData').id  || ''
    // );
    // headers = headers.append(
    //   'subModuleCd',
    //   getSessionData('subModuleCd')?.subModuleCd.toString()
    // );
    return this.http.post<Campaign[]>(BACKEND_URL + '/getCampaignList', {
      campaignType,
    });
  }

  /** Diagnostics APIs */

  // Draft APIs

  getDraftTransactionDetails(animalId?: number) {
    const req: any = {
      userId: JSON.parse(sessionStorage.getItem('user'))?.userId,
      subModuleCd: getSessionData('subModuleCd')?.subModuleCd
        ? getSessionData('subModuleCd')?.subModuleCd.toString()
        : '',
    };

    if (animalId) req.animalId = animalId;

    return this.http.post<SaveInDraftResponse[] | ErrorResponse>(
      this.commonApiUrl + '/getDraftTransactionDetails',
      req
    );
    // return this.http.post<SaveInDraftResponse[] | ErrorResponse>(
    //   this.tempUrl + '/getDraftTransactionDetails',
    //   req
    // );
  }

  saveDraftTransactionDetails(requestObj: DraftRequest) {
    return this.http.post<SaveInDraftResponse[] | ErrorResponse>(
      this.commonApiUrl + '/saveDraftTransactionDetails',
      requestObj
    );
    // return this.http.post<SaveInDraftResponse[] | ErrorResponse>(
    //   this.tempUrl + '/saveDraftTransactionDetails',
    //   requestObj
    // );
  }

  deleteDraftTransactionDetails(draftId: number) {
    return this.http.delete(
      this.commonApiUrl + '/deleteDraftTransactionDetails',
      { params: { draftId } }
    );
    // return this.http.delete(this.tempUrl + '/deleteDraftTransactionDetails', {
    //   params: { draftId },
    // });
  }
  // Draft APIs

  downloadFile(fileKey: FormData) {
    return this.http.post(this.commonApiUrl + '/downloadFile', fileKey, {
      observe: 'response',
      responseType: 'blob' as 'json',
    });
  }

  // Get animals by Village

  getAnimalbyVillage(req: any) {
    return this.http.post(
      `${this.animalApi}animalmanagement/animal/getAnimalDetailByOwnerAttribute`,
      req
    );
  }

  //Sample test type
  getSampleTestTypeMaster() {
    return of([
      {
        id: 1,
        value: 'Sero Monitoring',
      },
    ]);
  }

  //Sample test type
  getPlanIdMaster() {
    return of([
      {
        id: 1,
        value: 'Plan A',
      },
    ]);
  }

  //handling error

  handleError(param: {
    title: string;
    message?: string;
    primaryBtnText: string;
  }) {
    this.dialog.open(TreatmentResponseDialogComponent, {
      data: {
        title: param.title,
        icon: 'assets/images/info.svg',
        message: param.message,
        primaryBtnText: param.primaryBtnText,
      },
      panelClass: 'common-info-dialog',
      width: '500px',
    });
  }

  //disease testing APIs//
  getGroupbyVillage(villageCd: number) {
    return this.http.post(`${this.apiUrlAnimalHealth}/getGroupsByVillageCd`, {
      villageCd: villageCd,
    });
  }

  getAnimalbyGroup(groupId: number) {
    return this.http.post(
      `${this.apiUrlAnimalHealth}/getAnimalDetailsByGroupId`,
      { groupId: groupId }
    );
  }

  getAnimalHealthHistory(
    animalId: number,
    animalHistoryCd: number,
    fromDate: string,
    toDate: string
  ) {
    return this.http.post<StatusReport>(
      `${this.apiUrl}/getAnimalHealthHistory`,
      {
        animalId,
        animalHistoryCd,
        fromDate,
        toDate,
      }
    );
  }

  // downloadAnimalReportFile(fileKey: FormData) {
  //   return this.http.post(this.commonApiUrl + '/report/downloadHistoryReport', fileKey, {
  //     observe: 'response',
  //     responseType: 'blob' as 'json',
  //   });
  // }
  downloadAnimalReportFile(StatusReport: StatusReport) {
    const requestOptions: Object = {
      observe: 'response',
      responseType: 'blob' as 'json',
    };
    return this.http.post(
      this.commonApiUrl + '/report/downloadHistoryReport',
      StatusReport,
      requestOptions
    );
  }
  //disease testing APIs//

  //view Health History
  viewAnimalHistory(animalData, code) {
    const dialogRef = this.dialog.open(HealthHistoryComponent, {
      data: {
        animalData: animalData,
        Flag: 0,
        animalHistoryCd: code,
        parent: 'health',
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

  getOwnerDetailsPageWise(
    ownerId: string | number,
    ownerType: OwnerType,
    pageNo: number,
    itemPerPage: number
  ) {
    return this.http.post<any>(
      this.animalApi + 'animalmanagement/owner/getOwnerDetailsPageWise',
      {
        ownerId,
        ownerType,
        pageNo,
        itemPerPage,
      }
    );
  }

  //
  // getSubOrgList() {
  //   return this.http.get<LabMaster[]>(this.adminApiUrl + 'getSubOrgList');
  // }
  getSubOrgList(subOrgType: number, stateCheck = true) {
    return this.http.post<LabMaster[]>(`${this.adminApiUrl}/getSubOrgList`, {
      subOrgType: subOrgType,
      stateCheck,
    });
  }

  getCurrentDate() {
    return this.http
      .get<{ value: string }>(this.dateUrl + '/getCurrentDate')
      .pipe(map((res) => new Date(res.value)));
  }

  get currentDate() {
    return moment(new Date(sessionStorage.getItem('serverCurrentDateTime')));
  }
}

export interface DraftRequest {
  userId: string;
  animalId: number;
  subModuleCd: number;
  tagId: number;
  creationDate: Date;
  lastUpdateDate: Date;
  draftJson: any;
}
