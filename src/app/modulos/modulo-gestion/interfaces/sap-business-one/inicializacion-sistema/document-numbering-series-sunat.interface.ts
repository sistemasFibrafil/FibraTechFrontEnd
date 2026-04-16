export interface IDocumentNumberingSeriesSunat {
  u_BPP_NDTD        : string;
  u_BPP_NDSD        : string;
  u_BPP_NDCD        : string;
}


export interface IDocumentNumberingSeriesSunatQuery {
  u_BPP_NDTD        : string;
  u_BPP_NDSD        : string;
  u_BPP_NDCD        : string;

  u_Delivery        : string;
  u_SalesInvoices   : string;
  u_Transfer        : string;
  u_Default         : string;
}
