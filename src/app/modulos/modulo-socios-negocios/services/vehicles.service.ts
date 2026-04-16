import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { IVehicles } from 'src/app/modulos/modulo-socios-negocios/interfaces/vehicles.interface';
import { VehiclesCreateModel } from '../models/vehicles.model';


@Injectable({providedIn: 'root'})
export class VehiclesService {
  constructor
  (
    private http: HttpClient
  ) { }

  getListByFilter(value: any) {
    let params = new HttpParams();
    params = params.append('u_FIB_COTR', value.u_FIB_COTR);
    params = params.append('searchText', value.searchText);

    return this.http.get<IVehicles[]>(`${environment.url_api_fib}Vehicles/GetListByFilter/`,{params: params});
  }

  setCreate(value: VehiclesCreateModel) {
    const param: string = JSON.stringify(value);

    return this.http.post<any>(`${environment.url_api_fib}Vehicles/SetCreate/`, param);
  }
}
