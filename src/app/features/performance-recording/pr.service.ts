import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { map, filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { OwnerDetails } from '../animal-breeding/artificial-insemination/ai-model/owner-detail.model';
import { CommonMaster } from '../animal-health/animal-treatment/models/common-master.model';
import { Config } from '../animal-health/deworming/models/config.model';
import { CommonRes } from '../animal-health/models/common-res.model';
import { PreviewDialogComponent } from './components/preview-dialog/preview-dialog.component';
import { SaveMrRes } from './milk-recording/models/save-mr-res.model';
import { Village } from 'src/app/features/animal-health/intimation-report/models/village.model';
import { LabMaster } from '../animal-health/animal-treatment/models/master.model';
import moment from 'moment';
import { GeneticHistoryRes } from './genetic-analysis/models/genetic-history-res.model';
import { SearchValue } from 'src/app/shared/common-search-box/common-search-box.component';
const BACKEND_URL = environment.apiURL + 'admin/user/';
@Injectable({
  providedIn: 'root',
})
export class PrService {
  private readonly apiUrl = environment.apiURL + 'animalperformance';
  private readonly adminApiUrl = environment.apiURL + 'admin/organization/';

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  get currentDate() {
    return moment(new Date(sessionStorage.getItem('serverCurrentDateTime')));
  }

  getConfigDetails(keys: string[]) {
    return this.http.post<{ [key: string]: Config }[]>(
      `${environment.apiURL}commonutility/getConfigDetails`,
      keys
    );
  }
  getVillagesByUser() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    return this.http.post<Village[]>(BACKEND_URL + 'getVillagesForUser', {
      userId: user.userId,
    });
  }
  getSearchDetails(searchValue: SearchValue) {
    return this.http
      .get<OwnerDetails[]>(
        `${
          environment.apiURL + 'animalperformance'
        }/search/getSearchDetails?searchCriteria=${
          searchValue.searchValue
        }&ownerType=${searchValue?.ownerType}
        &pageNo=${searchValue?.pageNo}&itemPerPage=${searchValue?.itemPerPage}`
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getAnimalHistory(tagId: any) {
    return this.http
      .get<any[]>(
        `${
          environment.apiURL + 'animalperformance'
        }/mr/getMRHistory?tagId=${tagId}`
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getPreviousMRHistory(param: any) {
    return this.http.post<any[]>(
      `${this.apiUrl}/mr/getPreviousMRHistory`,
      param
    );
  }

  getMRHistory(tagId: any) {
    return this.http.get<any[]>(`${this.apiUrl}/mr/getMRHistory`, {
      params: { tagId },
    });
  }

  registerNewMR(params: any) {
    return this.http.post<CommonRes<SaveMrRes>>(
      `${environment.apiURL + 'animalperformance'}/mr/saveMRDetails`,
      params
    );
  }
  updateMRRecord(params: any) {
    return this.http.put(`${this.apiUrl}/mr/updateMRDetails`, params);
  }
  getCommonMaster(key: string) {
    return this.http.post<CommonMaster[]>(
      `${environment.apiURL}commonutility/getCommonMaster`,
      {
        key,
      }
    );
  }
  getMRScheduleList(villace_object: any) {
    return this.http.get<any[]>(
      `${this.apiUrl}/mr/getAnimalsEligibleForMR?${villace_object?.villageCodes}&pageNo=${villace_object?.pageNo}&itemPerPage=${villace_object?.itemPerPage}`
    );
  }

  createMRSchedule(params: any) {
    return this.http.post(this.apiUrl + '/mr/saveMRScheduleDetails', params);
  }
  viewMRScheduleList(mrDate: string, projectId: string) {
    return this.http.get<any[]>(
      `${this.apiUrl}/mr/viewMRSchedules?mrStartDate=${mrDate}&projectId=${projectId}`
    );
  }
  updateMRSchedule(params: any) {
    return this.http.put(this.apiUrl + '/mr/updateMRScheduleDetails', params);
  }

  addAnimalCreateMRSchedule(tag_id: number) {
    return this.http.get<any[]>(
      `${this.apiUrl}/mr/addAnimalToCreateMRSchedule?tagId=${tag_id}`
    );
  }

  openPreviewDialog(formValue: any) {
    return this.dialog
      .open(PreviewDialogComponent, {
        data: formValue,
      })
      .afterClosed()
      .pipe(filter((res) => res));
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

  getWarningMessage(req: any) {
    return this.http.post<any>(this.apiUrl + '/mr/warningMsg', req);
  }

  cloneMRScheduleList(villace_object: any) {
    return this.http.get<any[]>(
      `${this.apiUrl}/mr/cloneAnimalsEligibleForMR?${villace_object?.villageCodes}
      &startDate=${villace_object?.startDate}&pageNo=${villace_object?.pageNo}&itemPerPage=${villace_object?.itemPerPage}`
    );
  }

  getSubOrgList(subOrgType: number, stateCheck = true) {
    return this.http.post<LabMaster[]>(`${this.adminApiUrl}/getSubOrgList`, {
      subOrgType,
      stateCheck,
    });
  }

  getGeneticHistory(tagId: string) {
    return this.http.get<GeneticHistoryRes>(
      this.apiUrl + '/geneticAnalysisHistory',
      {
        params: { tagId },
      }
    );
  }
}
