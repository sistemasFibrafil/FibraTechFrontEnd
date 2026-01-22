import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IProceso } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/general/proceso.interface';
import { ProcesoFindModel } from '../models/proceso.model';



@Injectable({providedIn: 'root'})
export class ProcesoService {
  constructor
  (
    private http: HttpClient,
    private datePipe: DatePipe
  ){ }

  getListByFiltro(value: ProcesoFindModel) {
    let params = new HttpParams();
    params = params.append('name', value.name);
    return this.http.get<IProceso[]>(`${environment.url_api_fib}Proceso/GetListByFiltro/`,{params: params});
  }
}
