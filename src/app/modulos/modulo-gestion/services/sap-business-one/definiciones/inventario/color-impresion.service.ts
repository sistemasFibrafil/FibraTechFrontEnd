import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { IColorImpresion } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/inventario/color-impresion.interface';
import { ColorImpresionModel } from 'src/app/modulos/modulo-gestion/models/sap-business-one/definiciones/inventario/color-impresion.model';



@Injectable({providedIn: 'root'})
export class ColorImpresionService {
  constructor
  (
    private http: HttpClient
  )
  { }

  getList() {
return this.http.get<IColorImpresion[]>(`${environment.url_api_fib}ColorImpresion/GetList`);
  }

  getListByFiltro(value: ColorImpresionModel) {
    let params = new HttpParams();
    params = params.append('name', value.name);
    return this.http.get<IColorImpresion[]>(`${environment.url_api_fib}ColorImpresion/GetListByFiltro`, { params: params });
  }
}
