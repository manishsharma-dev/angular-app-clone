import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { StatusReport } from './models/status-report.model';

@Injectable({
  providedIn: 'root',
})
export class StatusReportService {
  private readonly apiURL = environment.apiURL + 'commonutility/viewHistory';

  constructor(private readonly http: HttpClient) {}

  getStatusReport(
    animalId: number,
    animalStatusReport: number,
    fromDate: string,
    toDate: string
  ) {
    return this.http.post<StatusReport>(
      this.apiURL + '/getAllModulesTransactions',
      // 'https://ntha145juf.execute-api.ap-south-1.amazonaws.com/epashu/v1/animalbreeding/animalStatus/getAnimalStatusReport',
      {
        animalId,
        animalStatusReport,
        fromDate,
        toDate,
      }
    );
  }
}
