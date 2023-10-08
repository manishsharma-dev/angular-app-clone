import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SearchTestAIRes } from '../test-ai/test-ai-model/search-test-ai-res.model';

@Injectable({
  providedIn: 'root',
})
export class StrawManagementService {
  apiUrl: string = environment.apiURL;

  constructor(private http: HttpClient) {}

  validateExcel(semen_details: object) {
    return this.http.post<SearchTestAIRes[]>(
      `${this.apiUrl}animalbreeding/stockMgmt/importFromExcel`,
      semen_details
    );
  }

  getSemenStockTemplate(excelFileName: string) {
    const requestOptions: Object = {
      observe: 'response',
      responseType: 'blob' as 'json',
    };
    return this.http.post<any>(
      this.apiUrl + 'animalbreeding/stockMgmt/getTemplate',
      {},
      { ...requestOptions, params: { excelFileName } }
    );
  }
}
