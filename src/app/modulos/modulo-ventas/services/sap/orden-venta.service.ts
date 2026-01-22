import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { FilterRequestModel } from 'src/app/models/filter-request.model';
import { IPickingVentaItem } from '../../interfaces/picking-venta.interface';
import { IOrdenVenta, IOrdenVentaPendienteByFecha, IOrdenVentaSapPendienteByFiltro, IOrdenVentaSeguimientoByFecha, IOrdenVentaSeguimientoDetallado } from '../../interfaces/sap/orden-venta.interface';
import { OrdenVentaFilterModel, OrdenVentaSeguimientoFindModel } from '../../models/sap/orden-venta.model';
import { OrdenVentaCreateModel } from '../../models/web/orden-venta.model';


@Injectable({providedIn: 'root'})
export class OrdenVentaService {
  constructor(
    private http: HttpClient,
    private datePipe: DatePipe
  ) { }

  getListByFilter(value: OrdenVentaFilterModel) {
    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('docStatus', value.docStatus);
    params = params.append('searchText', value.searchText);
    return this.http.get<IOrdenVenta[]>(`${environment.url_api_fib}Orders/GetListByFilter/`,{params: params});
  }

  getByDocEntry(docEntry: number) {
      return this.http.get<IOrdenVenta>(`${environment.url_api_fib}Orders/GetByDocEntry/${docEntry}`);
    }

  getListOrdenVentaPendienteForPickingByCardCode(cardCode: string) {
    let params = new HttpParams();
    params = params.append('cardCode', cardCode);
    return this.http.get<any[]>(`${environment.url_api_fib}Orders/GetListOrdenVentaPendienteForPickingByCardCode/`,{params: params});
  }

  getOrdenVentaItemPendienteForPickingByBarCode(value: any) {
    let params = new HttpParams();
    params = params.append('idPicking', value.idPicking);
    params = params.append('docEntry', value.docEntry);
    params = params.append('cardCode', value.cardCode);
    params = params.append('whsCode', value.whsCode);
    params = params.append('barCode', value.barCode);
    params = params.append('codEstado', value.codEstado);
    params = params.append('idUsuario', value.idUsuario);

    return this.http.get<IPickingVentaItem>(`${environment.url_api_fib}Orders/GetOrdenVentaItemPendienteForPickingByBarCode/`,{params: params});
  }

  getListSeguimientoByFilter(value: OrdenVentaSeguimientoFindModel) {
    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('businessPartnerGroup', value.businessPartnerGroup);
    params = params.append('salesEmployee', value.salesEmployee);
    params = params.append('documentType', value.documentType);
    params = params.append('status', value.status);
    params = params.append('customer', value.customer);

    return this.http.get<IOrdenVentaSeguimientoByFecha[]>(`${environment.url_api_fib}Orders/GetListSeguimientoByFilter/`,{params: params});
  }

  getSeguimientoByFilterExcel(value: OrdenVentaSeguimientoFindModel){
    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('businessPartnerGroup', value.businessPartnerGroup);
    params = params.append('salesEmployee', value.salesEmployee);
    params = params.append('documentType', value.documentType);
    params = params.append('status', value.status);
    params = params.append('customer', value.customer);

    return this.http.get(`${environment.url_api_fib}Orders/GetSeguimientoByFilterExcel/`,{params: params, responseType: 'arraybuffer'});
  }

  getListSeguimientoDetalladoDireccionFiscalByFilter(value: OrdenVentaSeguimientoFindModel) {
    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('businessPartnerGroup', value.businessPartnerGroup);
    params = params.append('salesEmployee', value.salesEmployee);
    params = params.append('documentType', value.documentType);
    params = params.append('status', value.status);
    params = params.append('customer', value.customer);
    params = params.append('item', value.item);

    return this.http.get<IOrdenVentaSeguimientoDetallado[]>(`${environment.url_api_fib}Orders/GetListSeguimientoDetalladoDireccionFiscalByFilter/`,{params: params});
  }

  getSeguimientoDetalladoDireccionFiscalByFilterExcel(value: OrdenVentaSeguimientoFindModel){
    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('businessPartnerGroup', value.businessPartnerGroup);
    params = params.append('salesEmployee', value.salesEmployee);
    params = params.append('documentType', value.documentType);
    params = params.append('status', value.status);
    params = params.append('customer', value.customer);

    return this.http.get(`${environment.url_api_fib}Orders/GetSeguimientoDetalladoDireccionFiscalByFilterExcel/`,{params: params, responseType: 'arraybuffer'});
  }

  getListSeguimientoDetalladoDireccionDespachoByFilter(value: OrdenVentaSeguimientoFindModel) {
    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('businessPartnerGroup', value.businessPartnerGroup);
    params = params.append('salesEmployee', value.salesEmployee);
    params = params.append('documentType', value.documentType);
    params = params.append('status', value.status);
    params = params.append('customer', value.customer);
    params = params.append('item', value.item);

    return this.http.get<IOrdenVentaSeguimientoDetallado[]>(`${environment.url_api_fib}Orders/GetListSeguimientoDetalladoDireccionDespachoByFilter/`,{params: params});
  }

  getSeguimientoDetalladoDireccionDespachoByFilterExcel(value: OrdenVentaSeguimientoFindModel){
    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('businessPartnerGroup', value.businessPartnerGroup);
    params = params.append('salesEmployee', value.salesEmployee);
    params = params.append('documentType', value.documentType);
    params = params.append('status', value.status);
    params = params.append('customer', value.customer);
    params = params.append('item', value.item);

    return this.http.get(`${environment.url_api_fib}Orders/GetSeguimientoDetalladoDireccionDespachoByFilterExcel/`,{params: params, responseType: 'arraybuffer'});
  }

  getListOrdenVentaPendienteStockAlmacenProduccionByFecha(value: FilterRequestModel) {
    let params = new HttpParams();
    params = params.append('dat1', this.datePipe.transform(value.dat1, 'yyyy-MM-dd'));
    params = params.append('dat2', this.datePipe.transform(value.dat2, 'yyyy-MM-dd'));
    params = params.append('text1', value.text1);

    return this.http.get<IOrdenVentaPendienteByFecha[]>(`${environment.url_api_fib}Orders/GetListOrdenVentaPendienteStockAlmacenProduccionByFecha/`,{params: params});
  }

  getOrdenVentaPendienteStockAlmacenProduccionExcelByFecha(value: FilterRequestModel){
    let params = new HttpParams();
    params = params.append('dat1', this.datePipe.transform(value.dat1, 'yyyy-MM-dd'));
    params = params.append('dat2', this.datePipe.transform(value.dat2, 'yyyy-MM-dd'));
    params = params.append('text1', value.text1);

    return this.http.get(`${environment.url_api_fib}Orders/GetOrdenVentaPendienteStockAlmacenProduccionExcelByFecha/`,{params: params, responseType: 'arraybuffer'});
  }

  getListOrdenVentaProgramacionByFecha(value: FilterRequestModel) {
    let params = new HttpParams();
    params = params.append('dat1', this.datePipe.transform(value.dat1, 'yyyy-MM-dd'));
    params = params.append('dat2', this.datePipe.transform(value.dat2, 'yyyy-MM-dd'));
    params = params.append('text1', value.text1);

    return this.http.get<IOrdenVentaPendienteByFecha[]>(`${environment.url_api_fib}Orders/GetListOrdenVentaProgramacionByFecha/`,{params: params});
  }

  getOrdenVentaProgramacionExcelByFecha(value: FilterRequestModel){
    let params = new HttpParams();
    params = params.append('dat1', this.datePipe.transform(value.dat1, 'yyyy-MM-dd'));
    params = params.append('dat2', this.datePipe.transform(value.dat2, 'yyyy-MM-dd'));
    params = params.append('text1', value.text1);

    return this.http.get(`${environment.url_api_fib}Orders/GetOrdenVentaProgramacionExcelByFecha/`,{params: params, responseType: 'arraybuffer'});
  }

  getListOrdenVentaSodimacPendienteByFiltro(value: FilterRequestModel) {
    let params = new HttpParams();
    params = params.append('text1', value.text1);

    return this.http.get<IOrdenVentaSapPendienteByFiltro[]>(`${environment.url_api_fib}Orders/GetListOrdenVentaSodimacPendienteByFiltro/`,{params: params});
  }

  getOrdenVentaSodimacPendienteByDocEntry(docEntry: number) {
    let params = new HttpParams();
    params = params.append('id1', docEntry.toString());
    return this.http.get<IOrdenVentaSapPendienteByFiltro>(`${environment.url_api_fib}Orders/GetOrdenVentaSodimacPendienteById/`,{params: params});
  }

  getListOrdenVentaPreliminarPendienteByFecha(value: FilterRequestModel) {
    let params = new HttpParams();
    params = params.append('dat1', this.datePipe.transform(value.dat1, 'yyyy-MM-dd'));
    params = params.append('dat2', this.datePipe.transform(value.dat2, 'yyyy-MM-dd'));
    params = params.append('cod1', value.cod1);
    params = params.append('cod2', value.cod2);
    params = params.append('text1', value.text1);

    return this.http.get<IOrdenVentaSeguimientoDetallado[]>(`${environment.url_api_fib}Orders/GetListOrdenVentaPreliminarPendienteByFecha/`,{params: params});
  }

  getListOrdenVentaPreliminarPendienteExcelByFecha(value: FilterRequestModel){
    let params = new HttpParams();
    params = params.append('dat1', this.datePipe.transform(value.dat1, 'yyyy-MM-dd'));
    params = params.append('dat2', this.datePipe.transform(value.dat2, 'yyyy-MM-dd'));
    params = params.append('cod1', value.cod1);
    params = params.append('cod2', value.cod2);
    params = params.append('text1', value.text1);

    return this.http.get(`${environment.url_api_fib}Orders/GetListOrdenVentaPreliminarPendienteExcelByFecha/`,{params: params, responseType: 'arraybuffer'});
  }

  setCreate(value: OrdenVentaCreateModel) {
    const param: string = JSON.stringify(value);
    return this.http.post<any[]>(`${environment.url_api_fib}Orders/SetCreate/`, param);
  }
}
