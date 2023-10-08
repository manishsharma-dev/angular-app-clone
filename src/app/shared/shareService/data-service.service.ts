import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import moment from 'moment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { LabMaster } from 'src/app/features/animal-health/animal-treatment/models/master.model';
import { Config } from 'src/app/features/animal-health/deworming/models/config.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DataServiceService {
  apiUrl: string = environment.apiURL;
  private readonly commonApiUrl = environment.apiURL + 'commonutility';
  fetchProjectInfo: Observable<any>;
  gestationDayInfo: Observable<any>;
  private _observeSelection = new BehaviorSubject<any>(null);
  private _observeDays = new BehaviorSubject<any>(null);
  currentDate = sessionStorage.getItem('serverCurrentDateTime')
  constructor(private http: HttpClient) {
    this.fetchProjectInfo = this._observeSelection.asObservable();
    this.gestationDayInfo = this._observeDays.asObservable();
  }

  _fetchLoggedUserDatails() {
    const userDetails = JSON.parse(sessionStorage.getItem('user'));
    return userDetails;
  }

  _getUserDetailsByUserId() {
    const userInfo = this._fetchLoggedUserDatails();
    return this.http.post<any>(
      `${this.apiUrl}admin/user/getUserDetails?userId=${userInfo?.userId}`,
      {}
    );
  }
  _getOrganizationList(org_type: any, stateCheck = true) {
    return this.http.post<LabMaster[]>(
      `${this.apiUrl}admin/organization/getSubOrgList`, { ...org_type, stateCheck }
    );
  }

  _getProjectDetail(projectId): Observable<any[]> {
    let payload = {
      projectId: projectId,
    };
    return this.http.post<any[]>(
      this.apiUrl + 'admin/project/getProjectDetails',
      payload
    );
  }

  getDefaultConfig(key: string) {
    return this.http.post<Config>(this.commonApiUrl + '/getConfigDetail', {
      key,
    });
  }

  getProjectInfo() {
    return this._observeSelection.asObservable();
  }

  setProjectInfo(data) {
    this._observeSelection.next(data);
  }
  _enableDisableFormKeys(form: any, name_list: any, type: string) {
    name_list.forEach(element => {
      form[element][type]()
    });

  }
  setGestationDaysInformation(data) {
    this._observeDays.next(data);
  }
  _setScheduleAccordingFrequency(frequency) {
    if (sessionStorage.getItem('serverCurrentDateTime')) {
      switch (frequency) {

        case 1:
          let currentDate = new Date(sessionStorage.getItem('serverCurrentDateTime'));
          let dates: any = {
            startDate: '',
            scheduleUpto: ''
          }
          currentDate.setDate(
            currentDate.getDate() +
            ((1 + 7 - currentDate.getDay()) % 7 || 7)
          );

          dates.startDate = moment(currentDate).format('YYYY-MM-DD'),
            dates.scheduleUpto = moment(currentDate).add(6, 'days')
              .format('YYYY-MM-DD')

          return dates
        case 2:
          let date = new Date(sessionStorage.getItem('serverCurrentDateTime'));
          let weekDate: any = {
            startDate: '',
            scheduleUpto: ''
          }
          date.setDate(
            date.getDate() +
            ((1 - 7 - date.getDay()) % 7 || 7)
          );
          weekDate.startDate = moment(date).format('YYYY-MM-DD'),
            weekDate.scheduleUpto = moment(date)
              .add(6, 'days')
              .format('YYYY-MM-DD');

          return weekDate
        case 3:
          let mndate = new Date(sessionStorage.getItem('serverCurrentDateTime'));
          let nmDate: any = {
            startDate: '',
            scheduleUpto: ''
          }
          nmDate.startDate = moment(mndate).add(1, 'M').startOf('month').format('YYYY-MM-DD');
          console.log(nmDate.startDate)
          nmDate.scheduleUpto = moment(mndate).add(1, 'M')
            .endOf('month')
            .format('YYYY-MM-DD');
          return nmDate
        case 4:

          let fortnightdate = new Date(sessionStorage.getItem('serverCurrentDateTime'));
          let fnDate: any = {
            startDate: '',
            scheduleUpto: ''
          }
          const getCurrentDate = fortnightdate.getDate()
          const getYear = fortnightdate.getFullYear()
          const getMonth = fortnightdate.getMonth();
          if (getCurrentDate <= 15) {

            var firstDay: any = new Date(getYear, getMonth, 16);
            fnDate.startDate = moment(firstDay).format('YYYY-MM-DD');
            // fnDate.scheduleUpto = moment(fnDate.startDate)
            //   .add(15, 'days')
            //   .format('YYYY-MM-DD');
            var lastDay: any = new Date(getYear, getMonth + 1, 0);
            fnDate.scheduleUpto = moment(lastDay)
              .format('YYYY-MM-DD');
          } else {
            var firstDay: any = new Date(getYear, getMonth + 1, 1);
            // var lastDay: any = new Date(getYear, getMonth + 1, 0);
            fnDate.startDate = moment(firstDay).format('YYYY-MM-DD');
            // fnDate.scheduleUpto = moment(lastDay)
            //   .format('YYYY-MM-DD');
            fnDate.scheduleUpto = moment(fnDate?.startDate)
              .add(14, 'days')
              .format('YYYY-MM-DD');

          }
          return fnDate

        default:
          let dfCurrentDate = new Date(sessionStorage.getItem('serverCurrentDateTime'))
          let dfdates: any = {
            startDate: '',
            scheduleUpto: ''
          }
          dfdates.startDate = moment(dfCurrentDate).format('YYYY-MM-DD')
          dfdates.scheduleUpto = moment(dfCurrentDate).format('YYYY-MM-DD')
          return dfdates;
      }
    }


  }
  getCurrentServeDate() {
    return this.http.get<any>(this.commonApiUrl + '/getCurrentDate');
  }
  _getLabsListing() {
    return this.http.get(`${this.apiUrl}animalbreeding/search/getLaboratoryList`);
  }
}
