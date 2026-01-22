import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EntregaVentaCreateModel } from '../../models/entrega.model';
import { IGuiaSapByFecha } from '../../interfaces/sap/entrega-sap.interface';
import { FilterRequestModel } from 'src/app/models/filter-request.model';


@Injectable({providedIn: 'root'})
export class EntregaSapService {
  constructor
  (
    private http: HttpClient,
    private datePipe: DatePipe
  ) { }

  setCreate(value: EntregaVentaCreateModel) {
    const param: string = JSON.stringify(value);
    return this.http.post(`${environment.url_api_fib}EntregaSap/SetCreate/`, param);
  }

  getListGuiaByFecha(value: FilterRequestModel) {
    var params = new HttpParams();
    params = params.append('dat1', this.datePipe.transform(value.dat1, 'yyyy-MM-dd'));
    params = params.append('dat2', this.datePipe.transform(value.dat2, 'yyyy-MM-dd'));
    return this.http.get<IGuiaSapByFecha[]>(`${environment.url_api_fib}EntregaSap/GetListGuiaByFecha/`,{params: params});
  }

  getGuiaExcelByFecha(value: FilterRequestModel){
    var params = new HttpParams();
    params = params.append('dat1', this.datePipe.transform(value.dat1, 'yyyy-MM-dd'));
    params = params.append('dat2', this.datePipe.transform(value.dat2, 'yyyy-MM-dd'));
    return this.http.get(`${environment.url_api_fib}EntregaSap/GetGuiaExcelByFecha/`,{params: params, responseType: 'arraybuffer'});
  }
}
