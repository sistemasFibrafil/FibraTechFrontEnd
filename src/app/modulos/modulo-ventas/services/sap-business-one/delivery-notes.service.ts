import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { HttpClient, HttpParams } from '@angular/common/http';

import { DeliveryNotesCancelModel, DeliveryNotesCloseModel, DeliveryNotesCreateModel, DeliveryNotesFilterModel, DeliveryNotesUpdateModel } from '../../models/sap-business-one/delivery-notes.model';
import { IDeliveryNotes, IDeliveryNotesQuery } from '../../interfaces/sap-business-one/delivery-notes.interface';


@Injectable({providedIn: 'root'})
export class DeliveryNotesService {
  constructor
  (
    private http: HttpClient,
    private datePipe: DatePipe
  ) { }

  getListByFilter(value: DeliveryNotesFilterModel) {
    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('docStatus', value.docStatus);
    params = params.append('searchText', value.searchText);
    return this.http.get<IDeliveryNotesQuery[]>(`${environment.url_api_fib}DeliveryNotes/GetListByFilter/`,{params: params});
  }

  getByDocEntry(docEntry: number) {
    return this.http.get<IDeliveryNotesQuery>(`${environment.url_api_fib}DeliveryNotes/GetByDocEntry/${docEntry}`);
  }

  // getListGuiaByFecha(value: FilterRequestModel) {
  //   var params = new HttpParams();
  //   params = params.append('dat1', this.datePipe.transform(value.dat1, 'yyyy-MM-dd'));
  //   params = params.append('dat2', this.datePipe.transform(value.dat2, 'yyyy-MM-dd'));
  //   return this.http.get<IGuiaSapByFecha[]>(`${environment.url_api_fib}EntregaSap/GetListGuiaByFecha/`,{params: params});
  // }

  // getGuiaExcelByFecha(value: FilterRequestModel){
  //   var params = new HttpParams();
  //   params = params.append('dat1', this.datePipe.transform(value.dat1, 'yyyy-MM-dd'));
  //   params = params.append('dat2', this.datePipe.transform(value.dat2, 'yyyy-MM-dd'));
  //   return this.http.get(`${environment.url_api_fib}DeliveryNotes/GetGuiaExcelByFecha/`,{params: params, responseType: 'arraybuffer'});
  // }

  setCreate(value: DeliveryNotesCreateModel) {
    const param: string = JSON.stringify(value);
    return this.http.post<any[]>(`${environment.url_api_fib}DeliveryNotes/SetCreate/`, param);
  }

  setUpdate(value: DeliveryNotesUpdateModel) {
    const param: string = JSON.stringify(value);
    return this.http.put(`${environment.url_api_fib}DeliveryNotes/SetUpdate/`, param);
  }

  setClose(value: DeliveryNotesCloseModel) {
    const param: string = JSON.stringify(value);
    return this.http.put(`${environment.url_api_fib}DeliveryNotes/SetClose/`, param);
  }

  setCancel(value: DeliveryNotesCancelModel) {
    const param: string = JSON.stringify(value);
    return this.http.put(`${environment.url_api_fib}DeliveryNotes/SetCancel/`, param);
  }

  getPrintNationalDocEntry(docEntry: number) {
    return this.http.get(`${environment.url_api_fib}DeliveryNotes/GetPrintNationalDocEntry/${docEntry}`, {responseType: 'blob',  observe: 'response', reportProgress: true });
  }

  getPrintExportDocEntry(docEntry: number) {
    return this.http.get(`${environment.url_api_fib}DeliveryNotes/GetPrintExportDocEntry/${docEntry}`, {responseType: 'blob',  observe: 'response', reportProgress: true });
  }
}
