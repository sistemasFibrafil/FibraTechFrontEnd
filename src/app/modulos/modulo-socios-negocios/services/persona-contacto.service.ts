import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { HttpClient, HttpParams } from '@angular/common/http';

import { IPersonaContactoSap } from '../interfaces/persona-contacto.interface';
import { FilterRequestModel } from 'src/app/models/filter-request.model';


@Injectable({providedIn: 'root'})
export class PersonaContactoSapService {
  constructor
  (
    private http: HttpClient
  ) { }

  getListByFiltro(value: FilterRequestModel) {
    let params = new HttpParams();
    params = params.append('cod1', value.cod1);
    params = params.append('text1', value.text1);

    return this.http.get<IPersonaContactoSap[]>(`${environment.url_api_fib}PersonaContactoSap/GetListByFiltro/`,{params: params});
  }

  getById(value: FilterRequestModel) {
    let params = new HttpParams();
    params = params.append('id1', value.id1);
    params = params.append('cod1', value.cod1);
    return this.http.get<IPersonaContactoSap>(`${environment.url_api_fib}PersonaContactoSap/GetById/`,{params: params});
  }
}
