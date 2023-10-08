import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SaveTypingDetailsRes } from './models/save-typing-res.model';
import { TypingTrait } from './models/typing-trait.model';

@Injectable({
  providedIn: 'root',
})
export class TypingService {
  private readonly apiUrl = environment.apiURL + 'animalperformance/typing/';

  constructor(private http: HttpClient) {}

  saveTypingDetails(req: any) {
    return this.http.post<SaveTypingDetailsRes>(
      this.apiUrl + 'saveTypingDetails',
      req
    );
  }

  getAssociatedCalvingBeforeTyping(tagId: number) {
    return this.http.get<{ msg: string }>(
      this.apiUrl + 'getAssociatedCalvingBeforeTyping',
      {
        params: { tagId },
      }
    );
  }

  getTypingTraitsValue() {
    return this.http.get<TypingTrait[]>(this.apiUrl + 'getTypingTraitsValue');
  }
}
