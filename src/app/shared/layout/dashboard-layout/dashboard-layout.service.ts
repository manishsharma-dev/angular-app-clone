import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LanguageModel } from 'src/app/features/dashboard/model/language.model';
import { environment } from 'src/environments/environment';
const BACKEND_URL = environment.apiURL;

@Injectable({
  providedIn: 'root'
})

export class DashboardLayoutService {
  private Language = new BehaviorSubject<string>('English');
  constructor(private http: HttpClient, private translateService: TranslateService) { }

  // castLanguage = this.Language.asObservable();

  setlangauge(lang: any) {
    this.Language.next(lang);
    this.translateService.use(lang)

  }
  getlangauge() {
    return this.Language.asObservable().pipe(tap(v => { }));
  }
  getLan() {
    const payload = {
      "key": "language_cd"
    }
    return this.http.post<LanguageModel[]>(BACKEND_URL + 'commonutility/getCommonMaster', payload);
  }

  getLabelByLanguageCd() {
    const payload = {
      "key": ""
    }
    return this.http.post<LanguageModel[]>(BACKEND_URL + 'commonutility/getLabelByLanguageCd', payload);
  }

  getCurrentServeDate() {
    return this.http.get<any>(BACKEND_URL + 'commonutility/getCurrentDate');
  }



}
