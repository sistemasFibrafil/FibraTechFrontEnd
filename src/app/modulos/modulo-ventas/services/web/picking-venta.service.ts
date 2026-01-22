import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { PickingByFiltroFindModel, PickingDeleteModel, PickingItemDeleteAllModel } from '../../models/picking-venta.model';
import { IPickingVenta, IPickingVentaByFiltro, IPickingVentaByIdPicking } from '../../interfaces/picking-venta.interface';
import { IEntregaById } from '../../interfaces/entrega.interface';

@Injectable({providedIn: 'root'})
export class PickingVentaService {

  constructor
  (
    private http: HttpClient,
    private datePipe: DatePipe
  ) { }

  getPickingNumero() {
    return this.http.get<IPickingVenta>(`${environment.url_api_fib}Picking/getPickingNumero/`);
  }

  getListPickingVentaByFiltro(value: PickingByFiltroFindModel) {
    let params = new HttpParams();
    params = params.append('fecInicial', this.datePipe.transform(value.fecInicial, 'yyyy-MM-dd'));
    params = params.append('fecFinal', this.datePipe.transform(value.fecFinal, 'yyyy-MM-dd'));

    return this.http.get<IPickingVentaByFiltro[]>(`${environment.url_api_fib}Picking/GetListPickingVentaByFiltro/`, {params: params});
  }

  getPickingVentaByIdPicking(idPicking: number) {
    return this.http.get<IPickingVentaByIdPicking>(`${environment.url_api_fib}Picking/GetPickingVentaByIdPicking/${idPicking}`);
  }

  getPickingVentaForEntregaByIdPicking(idPicking: number) {
    return this.http.get<IEntregaById>(`${environment.url_api_fib}Picking/GetPickingVentaForEntregaByIdPicking/${idPicking}`);
  }

  setCreate(value: IPickingVenta) {
    const param: string = JSON.stringify(value);

    if(value.idPicking == 0 || value.idPicking === undefined)
    {
        return this.http.post(`${environment.url_api_fib}Picking/SetCreate/`, param);
    }
    else
    {
      return this.http.put(`${environment.url_api_fib}Picking/SetUpdate/`, param);
    }
  }

  setDelete(value: PickingDeleteModel) {
    const param: string = JSON.stringify(value);
    return this.http.patch<IPickingVentaByFiltro>(`${environment.url_api_fib}Picking/SetDelete/`, param);
  }

  setDeleteItem(idPickingItem: number) {
    return this.http.delete<IPickingVentaByFiltro>(`${environment.url_api_fib}Picking/SetDeleteItem/${idPickingItem}`);
  }

  setDeleteItemAll(value: PickingItemDeleteAllModel) {
    const param: string = JSON.stringify(value);
    return this.http.patch<IPickingVentaByFiltro>(`${environment.url_api_fib}Picking/SetDeleteItemAll/`, param);
  }
}
