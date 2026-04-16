export class DocumentNumberingSeriesSunatFindModel {
  idUsuario               : number;
  u_BPP_NDTD              : string;
  u_BPP_NDCD              : string;

  u_Delivery              : string;
  u_SalesInvoices         : string;
  u_Transfer              : string;

  constructor(){
    this.idUsuario        = 0;
    this.u_BPP_NDTD       = '';
    this.u_BPP_NDCD       = '';
    this.u_Delivery       = '';
    this.u_SalesInvoices  = '';
    this.u_Transfer       = '';
  }
}
