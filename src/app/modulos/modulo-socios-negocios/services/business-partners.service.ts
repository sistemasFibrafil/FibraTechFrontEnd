import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { HttpClient, HttpParams } from '@angular/common/http';

import { IBusinessPartnersQuery } from '../interfaces/business-partners.interface';
import { SocioNegocioModel } from '../models/socio-negocio.model';


@Injectable({providedIn: 'root'})
export class BusinessPartnersService {
  constructor
  (
    private http: HttpClient
  ) { }

  getListByFilter(value: any) {
    let params = new HttpParams();
    params = params.append('cardType', value.cardType);
    params = params.append('searchText', value.searchText);
    return this.http.get<IBusinessPartnersQuery[]>(`${environment.url_api_fib}BusinessPartners/GetListByFilter/`,{params: params});
  }

  getListModalByFilter(value: any) {
    let params = new HttpParams();
    params = params.append('businessPartner', value.businessPartner);
    params = params.append('cardType', value.cardType);
    params = params.append('transType', value.transType);
    return this.http.get<IBusinessPartnersQuery[]>(`${environment.url_api_fib}BusinessPartners/GetListModalByFilter/`,{params: params});
  }

  getByCode(cardCode: string) {
    let params = new HttpParams();
    params = params.append('cardCode', cardCode);
    return this.http.get<IBusinessPartnersQuery>(`${environment.url_api_fib}BusinessPartners/GetByCode/`,{params: params});
  }

  getBusinessPartnerByCode(cardCode: string) {
    let params = new HttpParams();
    params = params.append('cardCode', cardCode);
    return this.http.get<SocioNegocioModel>(`${environment.url_api_fib}BusinessPartners/GetByCode/`, {params: params});
  }

  getVehicleByCode(cardCode: string) {
    let params = new HttpParams();
    params = params.append('cardCode', cardCode);
    return this.http.get<IBusinessPartnersQuery>(`${environment.url_api_fib}BusinessPartners/GetVehicleByCode/`,{params: params});
  }

  getDriverByCode(cardCode: string) {
    let params = new HttpParams();
    params = params.append('cardCode', cardCode);
    return this.http.get<IBusinessPartnersQuery>(`${environment.url_api_fib}BusinessPartners/getDriverByCode/`,{params: params});
  }

  getBusinessPartnerGroups(groupType: string) {
    let params = new HttpParams();
    params = params.append('groupType', groupType);
    return this.http.get<any[]>(`${environment.url_api_fib}BusinessPartnerGroups/GetListByGroupType`, {params: params});
  }

  setCreateBusinessPartner(data: SocioNegocioModel) {
    return this.http.post(`${environment.url_api_fib}BusinessPartners/Create`, data);
  }

  setUpdateBusinessPartner(data: SocioNegocioModel) {
    return this.http.put(`${environment.url_api_fib}BusinessPartners/Update`, data);
  }

  getPaymentTermsTypes() {
    return this.http.get<any[]>(`${environment.url_api_fib}PaymentTermsTypes/GetList`);
  }

  getSalesPersonsList() {
    return this.http.get<any[]>(`${environment.url_api_fib}SalesPersons/GetList`);
  }

  getCountries() {
    return this.http.get<any[]>(`${environment.url_api_fib}Countries/GetList`);
  }

  getStates(countryCode: string) {
    let params = new HttpParams();
    params = params.append('countryCode', countryCode);
    return this.http.get<any[]>(`${environment.url_api_fib}States/GetList`, { params: params });
  }

  getProvincias(dpto: string) {
    let params = new HttpParams();
    params = params.append('dpto', dpto);
    return this.http.get<any[]>(`${environment.url_api_fib}Ubigeo/GetListProvincias`, { params: params });
  }

  getDistritos(dpto: string, prov: string) {
    let params = new HttpParams();
    params = params.append('dpto', dpto);
    params = params.append('prov', prov);
    return this.http.get<any[]>(`${environment.url_api_fib}Ubigeo/GetListDistritos`, { params: params });
  }

  getListClienteBySectorStatus(value: any) {
    let params = new HttpParams();
    params = params.append('sector', value.sector);
    params = params.append('status', value.status);
    params = params.append('businessPartner', value.businessPartner);
    return this.http.get<IBusinessPartnersQuery[]>(`${environment.url_api_fib}BusinessPartners/GetListClienteBySectorStatus/`,{params: params});
  }

  getClienteBySectorStatusExcel(value: any) {
    let params = new HttpParams();
    params = params.append('sector', value.sector);
    params = params.append('status', value.status);
    params = params.append('businessPartner', value.businessPartner);
    return this.http.get(`${environment.url_api_fib}BusinessPartners/GetClienteBySectorStatusExcel/`,{params: params, responseType: 'arraybuffer'});
  }

  getPriceLists() {
    return this.http.get<any[]>(`${environment.url_api_fib}PriceLists/GetList`);
  }

  getTaxGroups() {
    return this.http.get<any[]>(`${environment.url_api_fib}TaxGroups/GetList`);
  }

  getDivisions() {
    return this.http.get<any[]>(`${environment.url_api_fib}Division/GetList`);
  }

  getSectors() {
    return this.http.get<any[]>(`${environment.url_api_fib}BusinessPartnerSectors/GetList`);
  }
}
