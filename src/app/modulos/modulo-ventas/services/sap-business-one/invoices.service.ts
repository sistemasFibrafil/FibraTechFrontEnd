import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { HttpClient, HttpParams } from '@angular/common/http';

import { IInvoiceOpenQuery, IInvoiceQuery } from '../../interfaces/sap-business-one/invoice.interface';
import { InvoiceCreateModel, InvoiceFilterModel, InvoicesCancelModel, InvoiceUpdateModel } from '../../models/sap-business-one/invoice.model';


@Injectable({providedIn: 'root'})
export class InvoicesService {
  constructor
  (
    private http: HttpClient,
    private datePipe: DatePipe
  ) { }


  getListOpen() {
    return this.http.get<IInvoiceOpenQuery[]>(`${environment.url_api_fib}Invoices/getListOpen/`);
  }

  getListByFilter(value: InvoiceFilterModel) {
    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('docStatus', value.docStatus);
    params = params.append('docSubType', value.docSubType);
    params = params.append('isIns', value.isIns);
    params = params.append('searchText', value.searchText);
    return this.http.get<IInvoiceQuery[]>(`${environment.url_api_fib}Invoices/GetListByFilter/`,{params: params});
  }

  getByDocEntry(docEntry: number) {
      return this.http.get<IInvoiceQuery>(`${environment.url_api_fib}Invoices/GetByDocEntry/${docEntry}`);
    }

  setCreate(value: InvoiceCreateModel) {
    const param: string = JSON.stringify(value);
    return this.http.post<any[]>(`${environment.url_api_fib}Invoices/SetCreate/`, param);
  }

  setUpdate(value: InvoiceUpdateModel) {
    const param: string = JSON.stringify(value);
    return this.http.put(`${environment.url_api_fib}Invoices/SetUpdate/`, param);
  }

  setCancel(value: InvoicesCancelModel) {
      const param: string = JSON.stringify(value);
      return this.http.put(`${environment.url_api_fib}Invoices/SetCancel/`, param);
    }
}
