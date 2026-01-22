import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { HttpClient, HttpParams } from '@angular/common/http';

import { IOrdenFabricacionGeneralBySede, IOrdenFabricacionBySede } from '../interfaces/ordenFabricacion.interface';
import { FilterRequestModel } from 'src/app/models/filter-request.model';

@Injectable({providedIn: 'root'})
export class OrdenFabricacionService {
  constructor(
    private http: HttpClient,
    private datePipe: DatePipe) { }

  getListBySede(value: FilterRequestModel) {
    let params = new HttpParams();
    params = params.append('dat1', this.datePipe.transform(value.dat1, 'yyyy-MM-dd'));
    params = params.append('dat2', this.datePipe.transform(value.dat2, 'yyyy-MM-dd'));
    params = params.append('cod1', value.cod1);

    return this.http.get<IOrdenFabricacionBySede[]>(`${environment.url_api_fib}OrdenFabricacionSap/GetListOrdenFabricacionBySede/`,{params: params});
  }

  getListExcelBySede(value: FilterRequestModel){
    let params = new HttpParams();
    params = params.append('dat1', this.datePipe.transform(value.dat1, 'yyyy-MM-dd'));
    params = params.append('dat2', this.datePipe.transform(value.dat2, 'yyyy-MM-dd'));
    params = params.append('cod1', value.cod1);

    return this.http.get(`${environment.url_api_fib}OrdenFabricacionSap/GetOrdenFabricacionExcelBySede/`,{params: params, responseType: 'arraybuffer'});
  }


  getListGeneralBySede(value: FilterRequestModel) {
    let params = new HttpParams();
    params = params.append('dat1', this.datePipe.transform(value.dat1, 'yyyy-MM-dd'));
    params = params.append('dat2', this.datePipe.transform(value.dat2, 'yyyy-MM-dd'));
    params = params.append('cod1', value.cod1);

    return this.http.get<IOrdenFabricacionGeneralBySede[]>(`${environment.url_api_fib}OrdenFabricacionSap/GetListOrdenFabricacionGeneralBySede/`,{params: params});
  }

  getGeneralExcelBySede(value: FilterRequestModel){
    let params = new HttpParams();
    params = params.append('dat1', this.datePipe.transform(value.dat1, 'yyyy-MM-dd'));
    params = params.append('dat2', this.datePipe.transform(value.dat2, 'yyyy-MM-dd'));
    params = params.append('cod1', value.cod1);

    return this.http.get(`${environment.url_api_fib}OrdenFabricacionSap/GetOrdenFabricacionGeneralExcelBySede/`,{params: params, responseType: 'arraybuffer'});
  }

}
