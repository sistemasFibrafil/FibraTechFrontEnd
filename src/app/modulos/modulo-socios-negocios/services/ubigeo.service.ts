import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { IUbigeo } from '../interfaces/ubigeo.interface';


@Injectable({providedIn: 'root'})
export class UbigeoService {
  constructor
  (
    private http: HttpClient
  ) { }

  getListByFilter(value: any) {
    let params = new HttpParams();
    params = params.append('searchText', value.searchText);

    return this.http.get<IUbigeo[]>(`${environment.url_api_fib}Ubigeo/GetListByFilter/`,{params: params});
  }
}
