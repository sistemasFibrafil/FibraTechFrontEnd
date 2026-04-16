import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { FilterRequestModel } from 'src/app/models/filter-request.model';
import { OrdersCloseModel, OrdersFilterModel, OrdersSeguimientoFindModel, OrdersUpdateModel } from '../../models/sap-business-one/orders.model';

import { IPickingVentaItem } from '../../interfaces/picking-venta.interface';
import { IOrdersPendiente, IOrdersQuery, IOrdersSodimacPendiente, IOrdersSeguimiento, IOrdersSeguimientoDetallado, IOrdersOpenQuery } from '../../interfaces/sap-business-one/orders.interface';


@Injectable({providedIn: 'root'})
export class OrdersService {
  constructor(
    private http: HttpClient,
    private datePipe: DatePipe
  ) { }


  getListOpen() {
    return this.http.get<IOrdersOpenQuery[]>(`${environment.url_api_fib}Orders/getListOpen/`);
  }

  getListByFilter(value: OrdersFilterModel) {
    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('docStatus', value.docStatus);
    params = params.append('searchText', value.searchText);
    return this.http.get<IOrdersQuery[]>(`${environment.url_api_fib}Orders/GetListByFilter/`,{params: params});
  }

  getByDocEntry(docEntry: number) {
    return this.http.get<any>(`${environment.url_api_fib}Orders/GetByDocEntry/${docEntry}`);
  }

  getToCopy(docEntry: number) {
    return this.http.get<IOrdersQuery>(`${environment.url_api_fib}Orders/GetToCopy/${docEntry}`);
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

  getListSeguimientoByFilter(value: OrdersSeguimientoFindModel) {
    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('businessPartnerGroup', value.businessPartnerGroup);
    params = params.append('salesEmployee', value.salesEmployee);
    params = params.append('documentType', value.documentType);
    params = params.append('status', value.status);
    params = params.append('customer', value.customer);

    return this.http.get<IOrdersSeguimiento[]>(`${environment.url_api_fib}Orders/GetListSeguimientoByFilter/`,{params: params});
  }

  getSeguimientoByFilterExcel(value: OrdersSeguimientoFindModel){
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

  getListSeguimientoDetalladoDireccionFiscalByFilter(value: OrdersSeguimientoFindModel) {
    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('businessPartnerGroup', value.businessPartnerGroup);
    params = params.append('salesEmployee', value.salesEmployee);
    params = params.append('documentType', value.documentType);
    params = params.append('status', value.status);
    params = params.append('customer', value.customer);
    params = params.append('item', value.item);

    return this.http.get<IOrdersSeguimientoDetallado[]>(`${environment.url_api_fib}Orders/GetListSeguimientoDetalladoDireccionFiscalByFilter/`,{params: params});
  }

  getSeguimientoDetalladoDireccionFiscalByFilterExcel(value: OrdersSeguimientoFindModel){
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

  getListSeguimientoDetalladoDireccionDespachoByFilter(value: OrdersSeguimientoFindModel) {
    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('businessPartnerGroup', value.businessPartnerGroup);
    params = params.append('salesEmployee', value.salesEmployee);
    params = params.append('documentType', value.documentType);
    params = params.append('status', value.status);
    params = params.append('customer', value.customer);
    params = params.append('item', value.item);

    return this.http.get<IOrdersSeguimientoDetallado[]>(`${environment.url_api_fib}Orders/GetListSeguimientoDetalladoDireccionDespachoByFilter/`,{params: params});
  }

  getSeguimientoDetalladoDireccionDespachoByFilterExcel(value: OrdersSeguimientoFindModel){
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

    return this.http.get<IOrdersPendiente[]>(`${environment.url_api_fib}Orders/GetListOrdenVentaPendienteStockAlmacenProduccionByFecha/`,{params: params});
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

    return this.http.get<IOrdersPendiente[]>(`${environment.url_api_fib}Orders/GetListOrdenVentaProgramacionByFecha/`,{params: params});
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

    return this.http.get<IOrdersSodimacPendiente[]>(`${environment.url_api_fib}Orders/GetListOrdenVentaSodimacPendienteByFiltro/`,{params: params});
  }

  getOrdenVentaSodimacPendienteByDocEntry(docEntry: number) {
    let params = new HttpParams();
    params = params.append('id1', docEntry.toString());
    return this.http.get<IOrdersSodimacPendiente>(`${environment.url_api_fib}Orders/GetOrdenVentaSodimacPendienteById/`,{params: params});
  }

  getListOrdenVentaPreliminarPendienteByFecha(value: FilterRequestModel) {
    let params = new HttpParams();
    params = params.append('dat1', this.datePipe.transform(value.dat1, 'yyyy-MM-dd'));
    params = params.append('dat2', this.datePipe.transform(value.dat2, 'yyyy-MM-dd'));
    params = params.append('cod1', value.cod1);
    params = params.append('cod2', value.cod2);
    params = params.append('text1', value.text1);

    return this.http.get<IOrdersSeguimientoDetallado[]>(`${environment.url_api_fib}Orders/GetListOrdenVentaPreliminarPendienteByFecha/`,{params: params});
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

  setCreate(value: any, files: any[]) {
    let formData: FormData = new FormData();

    console.log("VALUE: ", JSON.stringify(value));

    formData.append('value', JSON.stringify(value));

    files.forEach((element: any) => {
      formData.append('files', element);
    });

    return this.http.post(`${environment.url_api_fib}Orders/SetCreate/`, formData,{ reportProgress: true, observe: 'events'});
  }

  setUpdate(value: OrdersUpdateModel) {
    const param: string = JSON.stringify(value);
    return this.http.put<any>(`${environment.url_api_fib}Orders/SetUpdate/`, param);
  }

  setClose(value: OrdersCloseModel) {
    const param: string = JSON.stringify(value);
    return this.http.put(`${environment.url_api_fib}Orders/SetClose/`, param);
  }

  getPrintNationalDocEntry(docEntry: number) {
    return this.http.get(`${environment.url_api_fib}Orders/GetPrintNationalDocEntry/${docEntry}`, {responseType: 'blob',  observe: 'response', reportProgress: true });
  }

  getPrintExportPlantaDocEntry(docEntry: number) {
    return this.http.get(`${environment.url_api_fib}Orders/GetPrintExportPlantaDocEntry/${docEntry}`, {responseType: 'blob',  observe: 'response', reportProgress: true });
  }

  getPrintExportClienteDocEntry(docEntry: number) {
    return this.http.get(`${environment.url_api_fib}Orders/GetPrintExportClienteDocEntry/${docEntry}`, {responseType: 'blob',  observe: 'response', reportProgress: true });
  }
}
