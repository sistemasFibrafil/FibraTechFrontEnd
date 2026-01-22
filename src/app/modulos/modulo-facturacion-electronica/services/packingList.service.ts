import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

@Injectable({providedIn: 'root'})
export class PackingListService {
  constructor(
    private http: HttpClient) { }

  getPackingListPdfByDocEntry(docEntry: number) {
    return this.http.get(`${environment.url_api_fib}PickingList/GetListPickingPdfByDocEntry/${docEntry}`, {responseType: 'blob',  observe: 'response', reportProgress: true });
  }
}
