import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { IPicking } from '../interfaces/picking.inteface';
import { PickingCopyToFindModel, PickingCreateModel, PickingDeleteModel, PickingFilterModel, PickingFindModel, PickingPrintModel, PickingReleaseModel } from '../models/picking.model';
import { ISolicitudTraslado } from '../interfaces/solicitud-traslado.interface';


@Injectable({providedIn: 'root'})
export class PickingService {
  constructor
  (
    private http: HttpClient,
    private datePipe: DatePipe
  ) { }

  getByObject(value: any) {
    const param: string = JSON.stringify(value);
    return this.http.post<IPicking>(`${environment.url_api_fib}Picking/GetByObject/`, param);
  }

  getListByFilter(value: PickingFilterModel) {
    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('objType', value.objType);
    params = params.append('status', value.status);
    params = params.append('searchText', value.searchText);
    return this.http.get<IPicking[]>(`${environment.url_api_fib}Picking/GetListByFilter/`,{params: params});
  }

  getListByBaseEntry(value: PickingFindModel) {
    let params = new HttpParams();
    params = params.append('u_Status', value.u_Status);
    params = params.append('u_BaseEntry', value.u_BaseEntry);
    params = params.append('u_BaseType', value.u_BaseType);
    params = params.append('u_BaseLine', value.u_BaseLine);
    params = params.append('u_IsReturned', value.u_IsReturned);
    params = params.append('u_CodeBar', value.u_CodeBar);
    return this.http.get<IPicking[]>(`${environment.url_api_fib}Picking/GetListByBaseEntry/`,{params: params});
  }

  getListByBaseEntryBaseType(value: PickingFindModel) {
    let params = new HttpParams();
    params = params.append('u_BaseEntry', value.u_BaseEntry);
    params = params.append('u_BaseType', value.u_BaseType);

    return this.http.get<IPicking[]>(`${environment.url_api_fib}Picking/GetListByBaseEntryBaseType/`,{params: params});
  }

  getListByTarget(value: any) {
    let params = new HttpParams();
    params = params.append('u_TrgetEntry', value.u_TrgetEntry);
    params = params.append('u_TargetType', value.u_TargetType);
    params = params.append('u_TrgetLine', value.u_TrgetLine);
    params = params.append('u_CodeBar', value.u_CodeBar);
    return this.http.get<IPicking[]>(`${environment.url_api_fib}Picking/GetListByTarget/`,{params: params});
  }

  getToCopy(value: PickingCopyToFindModel) {
    const param: string = JSON.stringify(value);
    return this.http.post<ISolicitudTraslado>(`${environment.url_api_fib}Picking/GetToCopy/`, param);
  }

  setCreate(value: PickingCreateModel) {
    const param: string = JSON.stringify(value);
    return this.http.post<IPicking[]>(`${environment.url_api_fib}Picking/SetCreate/`, param);
  }

  setRelease(value: PickingReleaseModel) {
    const param: string = JSON.stringify(value);
    return this.http.patch<IPicking>(`${environment.url_api_fib}Picking/SetRelease/`, param);
  }

  setDeleteMassive(value: PickingDeleteModel) {
    const param: string = JSON.stringify(value);
    return this.http.patch<IPicking>(`${environment.url_api_fib}Picking/SetDeleteMassive/`, param);
  }

  setDelete(value: PickingDeleteModel) {
    const param: string = JSON.stringify(value);
    return this.http.patch<IPicking>(`${environment.url_api_fib}Picking/SetDelete/`, param);
  }

  getPickingPrint(value: PickingPrintModel) {
    var params = new HttpParams();
    params = params.append('u_TrgetEntry', value.u_TrgetEntry);
    params = params.append('u_TargetType', value.u_TargetType);
    return this.http.get(`${environment.url_api_fib}Picking/GetPickingPrint/`, {params: params, responseType: 'blob',  observe: 'response', reportProgress: true });
  }
}
