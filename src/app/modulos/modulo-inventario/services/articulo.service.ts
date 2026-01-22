import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { HttpClient, HttpParams } from '@angular/common/http';

import { FilterRequestModel } from 'src/app/models/filter-request.model';
import { IArticuloDocumentoSap, IArticulo, IArticuloVentaByGrupoSubGrupoEstado, IArticuloVentaStockByGrupoSubGrupo, IMovimientoStockByFechaSede, IArticuloReporte, IArticuloQuery } from '../interfaces/articulo.interface';
import { ArticuloModel, ArticuloSapForSodimacBySkuModel, MovimientoStokByFechaSedeFindModel } from '../models/articulo.model';


@Injectable({providedIn: 'root'})
export class ArticuloService {
  constructor
  (
    private http: HttpClient,
    private datePipe: DatePipe
  ) { }

  getListByFilter(value: any) {
    let params = new HttpParams();
    params = params.append('item', value.item);
    params = params.append('invntItem', value.invntItem);
    params = params.append('sellItem', value.sellItem);
    params = params.append('prchseItem', value.prchseItem);
    return this.http.get<IArticulo[]>(`${environment.url_api_fib}Items/GetListByFilter/`,{params: params});
  }

  getListByCode(value: any) {
    let params = new HttpParams();
    params = params.append('itemCode', value.itemCode);
    params = params.append('cardCode', value.cardCode);
    params = params.append('currency', value.currency);
    params = params.append('slpCode', value.slpCode);
    params = params.append('codTipoOperacion', value.codTipoOperacion);
    return this.http.get<IArticuloQuery[]>(`${environment.url_api_fib}Items/GetListByCode/`,{params: params});
  }

  getListStockGeneralSummary(value: any) {
    let params = new HttpParams();
    params = params.append('whsCode', value.whsCode);
    params = params.append('excluirInactivo', value.excluirInactivo);
    params = params.append('excluirSinStock', value.excluirSinStock);
    return this.http.get<IArticuloReporte[]>(`${environment.url_api_fib}Items/GetListStockGeneralSummary/`,{params: params});
  }

  getStockGeneralSummaryExcel(value: any){
    let params = new HttpParams();
    params = params.append('whsCode', value.whsCode);
    params = params.append('excluirInactivo', value.excluirInactivo);
    params = params.append('excluirSinStock', value.excluirSinStock);
    return this.http.get(`${environment.url_api_fib}Items/GetStockGeneralSummaryExcel/`,{params: params, responseType: 'arraybuffer'});
  }

  getListStockGeneralDetailed(value: any) {
    let params = new HttpParams();
    params = params.append('whsCode', value.whsCode);
    params = params.append('excluirInactivo', value.excluirInactivo);
    params = params.append('excluirSinStock', value.excluirSinStock);
    return this.http.get<IArticuloReporte[]>(`${environment.url_api_fib}Items/GetListStockGeneralDetailed/`,{params: params});
  }

  getStockGeneralDetailedExcel(value: any){
    let params = new HttpParams();
    params = params.append('whsCode', value.whsCode);
    params = params.append('excluirInactivo', value.excluirInactivo);
    params = params.append('excluirSinStock', value.excluirSinStock);
    return this.http.get(`${environment.url_api_fib}Items/GetStockGeneralDetailedExcel/`,{params: params, responseType: 'arraybuffer'});
  }

  getListArticuloVentaByGrupoSubGrupoEstado(value: FilterRequestModel) {
    let params = new HttpParams();
    params = params.append('cod1', value.cod1);
    params = params.append('cod2', value.cod2);
    params = params.append('cod3', value.cod3);
    params = params.append('cod4', value.cod4);

    return this.http.get<IArticuloVentaByGrupoSubGrupoEstado[]>(`${environment.url_api_fib}Items/GetListArticuloVentaByGrupoSubGrupoEstado/`,{params: params});
  }

  getArticuloVentaExcelByGrupoSubGrupoEstado(value: FilterRequestModel){
    let params = new HttpParams();
    params = params.append('cod1', value.cod1);
    params = params.append('cod2', value.cod2);
    params = params.append('cod3', value.cod3);
    params = params.append('cod4', value.cod4);

    return this.http.get(`${environment.url_api_fib}Items/GetArticuloVentaExcelByGrupoSubGrupoEstado/`,{params: params, responseType: 'arraybuffer'});
  }

  getListArticuloVentaStockByGrupoSubGrupo(value: FilterRequestModel) {
    let params = new HttpParams();
    params = params.append('cod1', value.cod1);
    params = params.append('cod2', value.cod2);
    params = params.append('cod3', value.cod3);

    return this.http.get<IArticuloVentaStockByGrupoSubGrupo[]>(`${environment.url_api_fib}Items/GetListArticuloVentaStockByGrupoSubGrupo/`,{params: params});
  }

  getArticuloVentaStockExcelByGrupoSubGrupo(value: FilterRequestModel){
    let params = new HttpParams();
    params = params.append('cod1', value.cod1);
    params = params.append('cod2', value.cod2);
    params = params.append('cod3', value.cod3);

    return this.http.get(`${environment.url_api_fib}Items/GetArticuloVentaStockExcelByGrupoSubGrupo/`,{params: params, responseType: 'arraybuffer'});
  }

  getListArticuloByGrupoSubGrupoFiltro(value: FilterRequestModel) {
    let params = new HttpParams();
    params = params.append('val1', value.val1.toString());
    params = params.append('val2', value.val2.toString());
    params = params.append('val3', value.val3.toString());
    params = params.append('val4', value.val4.toString());
    params = params.append('val5', value.val5.toString());
    params = params.append('cod1', value.cod1);
    params = params.append('cod2', value.cod2);
    params = params.append('cod3', value.cod3);
    params = params.append('text1', value.text1);

    return this.http.get<IArticuloReporte[]>(`${environment.url_api_fib}Items/GetListArticuloByGrupoSubGrupoFiltro/`,{params: params});
  }

  getListArticuloExcelByGrupoSubGrupoFiltro(value: FilterRequestModel){
    let params = new HttpParams();
    params = params.append('val1', value.val1.toString());
    params = params.append('val2', value.val2.toString());
    params = params.append('val3', value.val3.toString());
    params = params.append('val4', value.val4.toString());
    params = params.append('val5', value.val5.toString());
    params = params.append('cod1', value.cod1);
    params = params.append('cod2', value.cod2);
    params = params.append('cod3', value.cod3);
    params = params.append('text1', value.text1);

    return this.http.get(`${environment.url_api_fib}Items/GetListArticuloExcelByGrupoSubGrupoFiltro/`,{params: params, responseType: 'arraybuffer'});
  }

  getListMovimientoStockByFechaSede(value: MovimientoStokByFechaSedeFindModel) {
    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('location', value.location);
    params = params.append('typeMovement', value.typeMovement);
    params = params.append('customer', value.customer);
    params = params.append('item', value.item);

    return this.http.get<IMovimientoStockByFechaSede[]>(`${environment.url_api_fib}Items/GetListMovimientoStockByFechaSede/`,{params: params});
  }

  getMovimientoStockExcelByFechaSede(value: MovimientoStokByFechaSedeFindModel){
    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('location', value.location);
    params = params.append('typeMovement', value.typeMovement);
    params = params.append('customer', value.customer);
    params = params.append('item', value.item);

    return this.http.get(`${environment.url_api_fib}Items/GetMovimientoStockExcelByFechaSede/`,{params: params, responseType: 'arraybuffer'});
  }

  getArticuloForOrdenVentaSodimacBySku(value: ArticuloSapForSodimacBySkuModel) {
    const param: string = JSON.stringify(value);
    return this.http.post<any[]>(`${environment.url_api_fib}Items/GetArticuloForOrdenVentaSodimacBySku/`,param);
  }

  getArticuloVentaByCode(value: FilterRequestModel) {
    let params = new HttpParams();
    params = params.append('id1', value.id1.toString());
    params = params.append('cod1', value.cod1);
    params = params.append('cod2', value.cod2);
    params = params.append('cod3', value.cod3);

    return this.http.get<IArticuloDocumentoSap>(`${environment.url_api_fib}Items/GetArticuloVentaByCode/`,{params: params});
  }

  setCreateMassive(value: ArticuloModel) {
    const param: string = JSON.stringify(value);
    return this.http.post<IArticulo[]>(`${environment.url_api_fib}Items/SetCreateMassive/`, param);
  }
}
