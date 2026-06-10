import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import {  IOperationsTypes } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/operation-type.interface';


@Injectable({providedIn: 'root'})
export class OperationsTypesService {
  constructor
  (
    private http: HttpClient
  ) { }


  getList() {
    return this.http.get< IOperationsTypes[]>(`${environment.url_api_fib}OperationsTypes/GetList/`);
  }

  getListByFilter(value: any) {
    let params = new HttpParams();
    params = params.append('tipoOperacion', value.tipoOperacion);
    return this.http.get< IOperationsTypes[]>(`${environment.url_api_fib}OperationsTypes/GetListByFilter/`,{params: params});
  }

  getByCode(code: string) {
    let params = new HttpParams();
    params = params.append('code', code);
    return this.http.get< IOperationsTypes>(`${environment.url_api_fib}OperationsTypes/GetByCode/`,{params: params});
  }
}
