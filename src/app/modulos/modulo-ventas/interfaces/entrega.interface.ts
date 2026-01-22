export interface IEntregaById {
  idPicking         : number;
  cardCode          : string;
  currCode          : string;
  fullCurrName      : string;
  rate              : number;
  docRate           : number;
  slpCode           : number;
  slpName           : string;
  peso              : number;
  shipToCode        : string;
  address2          : string;
  payToCode         : string;
  address           : string;
  u_BPP_MDMT    : string;
  nomMotTraslado    : string;
  groupNum          : number;
  pymntGroup        : string;
  subTotal          : number;
  totalImpuesto     : number;
  total             : number;
  item              : IEntregaItemById[];
}


export interface IEntregaItemById {
  idPicking         : number;
  idPickingItem     : number;
  lineNumItem       : number;
  docEntry          : number;
  lineNum           : number;
  objType           : string;
  itemCode          : string;
  dscription        : string;
  whsCode           : string;
  unitMsr           : string;
  quantity          : number;
  peso              : number;
  taxCode           : string;
  acctCode          : string;
  currency          : string;
  priceBefDi        : number;
  discPrcnt         : number;
  price             : number;
  total             : number;
}
