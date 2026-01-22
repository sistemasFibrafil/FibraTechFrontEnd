import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { IForcastVenta, IForcastVentaByFecha, IForcastVentaConSinOc, IForcastVentaEstado, IForcastVentaNegocio } from '../../interfaces/web/forcast-venta.interface';
import { ForcastventaFindModel, ForcastventaImportModel } from '../../models/web/forcast-venta.model';



@Injectable({providedIn: 'root'})
export class ForCastVentaService {

  constructor
  (
    private http: HttpClient,
    private datePipe: DatePipe
  ) { }

  getListConSinOcAll() {
    return this.http.get<IForcastVentaConSinOc[]>(`${environment.url_api_fib}ForcastVentaConSinOc/GetListAll/`);
  }

  getListNegocioAll() {
    return this.http.get<IForcastVentaNegocio[]>(`${environment.url_api_fib}ForcastVentaNegocio/GetListAll/`);
  }

  getListEstadoAll() {
    return this.http.get<IForcastVentaEstado[]>(`${environment.url_api_fib}ForcastVentaEstado/GetListAll/`);
  }

  getListForcastVentaByFecha(value: ForcastventaFindModel) {
    let params = new HttpParams();
    params = params.append('fecInicial', this.datePipe.transform(value.fecInicial, 'yyyy-MM-dd'));
    params = params.append('fecFinal', this.datePipe.transform(value.fecFinal, 'yyyy-MM-dd'));

    return this.http.get<IForcastVentaByFecha[]>(`${environment.url_api_fib}ForcastVenta/GetListForcastVentaByFecha/`, {params: params});
  }

  getForcastVentaPlantillaExcel(){
    return this.http.get(`${environment.url_api_fib}ForcastVenta/GetForcastVentaPlantillaExcel/`,{responseType: 'arraybuffer'});
  }

  getById(idPicking: number) {
    return this.http.get<IForcastVenta>(`${environment.url_api_fib}ForcastVenta/GetById/${idPicking}`);
  }

  setImport(value: ForcastventaImportModel) {
    const param: string = JSON.stringify(value);
    return this.http.post(`${environment.url_api_fib}ForcastVenta/SetImport/`, param);
  }

  setCreate(value: IForcastVenta) {
    const param: string = JSON.stringify(value);
    return this.http.post(`${environment.url_api_fib}ForcastVenta/SetCreate/`, param);
  }

  setUpdate(value: IForcastVenta) {
    const param: string = JSON.stringify(value);
    return this.http.put(`${environment.url_api_fib}ForcastVenta/SetUpdate/`, param);
  }

  setDelete(idForcastVenta: number) {
    return this.http.delete<IForcastVentaByFecha>(`${environment.url_api_fib}ForcastVenta/SetDelete/${idForcastVenta}`);
  }
}
