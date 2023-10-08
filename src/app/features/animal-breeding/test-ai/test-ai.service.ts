import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CreateTestPlanRes } from './test-ai-model/create-test-plan-res.model';
import { GetBullListRes } from './test-ai-model/get-bull-list-res.model';
import { SearchTestAIRes } from './test-ai-model/search-test-ai-res.model';
import { CreateReq } from './test-ai-model/test-ai-req.model';
import { Organization } from './test-ai-model/org.model';

@Injectable({
  providedIn: 'root',
})
export class TestAIService {
  apiUrl: string = environment.apiURL;

  constructor(private http: HttpClient) {}

  searchTestAi(test_creteria: object) {
    return this.http.post<SearchTestAIRes[]>(
      `${this.apiUrl}animalbreeding/testAi/searchTestAi`,
      test_creteria
    );
  }

  getBullsListForTestAIPlan(searchValue: {
    bullId?: number;
    breedCd?: number;
    semenStationCodes?: number[];
  }) {
    return this.http.get<any>(
      `${this.apiUrl}animalbreeding/testAi/getBullsListFromSSForTestAI`,
      { params: { ...searchValue } }
    );
  }

  saveTestAiDetails(req: CreateReq) {
    return this.http.post<CreateTestPlanRes>(
      `${this.apiUrl}animalbreeding/testAi/saveTestAiDetails`,
      req
    );
  }
  getBullForTestAI(searchValue: {
    bullId?: number;
    breedCd?: number;
    semenStationCodes?: number[];
  }) {
    return this.http.get<any>(
      `${this.apiUrl}animalbreeding/testAi/getBullForTestAI`,
      { params: { ...searchValue } }
    );
  }

  getOrgList() {
    return this.http.get<Organization[]>(this.apiUrl + 'admin/organization/getOrgList')
  }
}
