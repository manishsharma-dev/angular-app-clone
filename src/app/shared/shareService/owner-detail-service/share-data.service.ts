import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShareDataService {
  private _data: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  
  constructor() { }
  

  public setData(data: boolean){
      this._data.next(data);
  }

  public getData(): Observable<any> {
      return this._data.asObservable();
  }
  
}
