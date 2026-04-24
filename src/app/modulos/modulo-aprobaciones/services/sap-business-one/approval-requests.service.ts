import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { ApprovalStatusReportFilterModel } from '../../models/sap-business-one/procedimiento-autorizacion/approval-requests.model';

import { IApprovalStatusReportQuery } from '../../interfaces/sap-business-one/approval-requests.interface';



@Injectable({providedIn: 'root'})
export class ApprovalRequestsService {
  constructor
  (
    private http: HttpClient,
    private datePipe: DatePipe
  ) { }

  getListApprovalStatusReport(value: ApprovalStatusReportFilterModel) {
    const param: string = JSON.stringify(value);
    return this.http.post<IApprovalStatusReportQuery[]>(`${environment.url_api_fib}ApprovalRequests/GetListApprovalStatusReport/`, param);
  }
}
