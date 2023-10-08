import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CommonRes } from '../../animal-health/models/common-res.model';
import { GrowthHistoryRes } from './models/animal-growth-history-res.model';
import { SaveGmReq } from './models/save-gm-req.model';
import { SaveGmRes } from './models/save-gm-res.model';
import { SearchValue } from 'src/app/shared/common-search-box/common-search-box.component';

@Injectable({
  providedIn: 'root',
})
export class GrowthMonitoringService {
  private readonly apiUrl = environment.apiURL + 'animalperformance/gm';
  // private readonly testUrl = environment.localApiUrl + 'animalperformance/gm';

  constructor(private http: HttpClient) {}

  getGMSearchDetails(searchValue: SearchValue) {
    return this.http.get<any>(
      this.apiUrl + '/getGMSearchDetails',

      {
        params: {
          searchCriteria: searchValue.searchValue,
          ownerType: searchValue.ownerType,
          pageNo:searchValue?.pageNo,
          itemPerPage:searchValue?.itemPerPage
        },
      }
    );
  }

  saveGmDetails(req: SaveGmReq) {
    return this.http.post<CommonRes<SaveGmRes>>(
      this.apiUrl + '/saveGMDetails',
      req
    );
  }

  animalGrowthHistory(tagId: number) {
    return this.http.get<GrowthHistoryRes>(
      this.apiUrl + '/animalGrowthHistory',
      {
        params: {
          tagId,
        },
      }
    );
  }
}
