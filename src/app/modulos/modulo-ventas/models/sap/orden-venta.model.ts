export class OrdenVentaModel {
}


export class OrdenVentaFilterModel {
  startDate                   : Date;
  endDate                     : Date;
  docStatus                   : string;
  searchText                  : string;

  constructor(){
    this.startDate            = null;
    this.endDate              = null;
    this.docStatus            = '';
    this.searchText           = '';
  }
}


export class OrdenVentaSeguimientoFindModel {
  startDate             : Date;
  endDate               : Date;
  businessPartnerGroup  : string;
  salesEmployee         : string;
  documentType          : string;
  status                : string;
  customer              : string;
  item                  : string;

  constructor(){
      this.startDate                =  null;
      this.endDate                  = null;
      this.businessPartnerGroup     = '';
      this.salesEmployee            = '';
      this.documentType             = '';
      this.status                   = '';
      this.customer                 = '';
      this.item                     = '';
  }
}
