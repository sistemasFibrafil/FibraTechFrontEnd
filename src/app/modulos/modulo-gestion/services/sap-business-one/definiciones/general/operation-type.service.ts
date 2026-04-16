import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import {  IOperationType } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/operation-type.interface';


@Injectable({providedIn: 'root'})
export class OperationTypeService {
  constructor
  (
    private http: HttpClient
  ) { }

  getListByFilter(value: any) {
    let params = new HttpParams();
    params = params.append('tipoOperacion', value.tipoOperacion);
    return this.http.get< IOperationType[]>(`${environment.url_api_fib}OperationType/GetListByFilter/`,{params: params});
  }
}
