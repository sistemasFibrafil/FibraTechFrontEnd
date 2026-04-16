import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { DriversCreateModel } from '../models/drivers.model';
import { IDrivers } from 'src/app/modulos/modulo-socios-negocios/interfaces/drivers.interface';


@Injectable({providedIn: 'root'})
export class DriversService {
  constructor
  (
    private http: HttpClient
  ) { }

  getListByFilter(value: any) {
    let params = new HttpParams();
    params = params.append('u_FIB_COTR', value.u_FIB_COTR);
    params = params.append('searchText', value.searchText);

    return this.http.get<IDrivers[]>(`${environment.url_api_fib}Drivers/GetListByFilter/`,{params: params});
  }

  setCreate(value: DriversCreateModel) {
    const param: string = JSON.stringify(value);

    return this.http.post<any>(`${environment.url_api_fib}Drivers/SetCreate/`, param);
  }
}
