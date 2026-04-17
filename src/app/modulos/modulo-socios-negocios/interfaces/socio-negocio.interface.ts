export interface ISocioNegocio {
  cardCode          : string;
  licTradNum        : string;
  cardName          : string;
  slpCode           : number;
  slpName           : string;
  cntctCode         : number;
  cntctPrsn         : string;
  billToDef         : string;
  address           : string;
  shipToDef         : string;
  address2          : string;
  currency          : string;
  groupNum          : number;
  nomSector         : string;
  nomDivision       : string;
  nomContacto       : string;
  createDate        : Date;
  lowDate?          : Date;
  fechaUltimaVenta  : Date;
  codStatus         : string;
  nomStatus         : string;
}
