export interface ISop {
  id                    : number;
  codYear               : number;
  codMonth              : number;
  codWeek               : number;
  name                  : string;
  comments              : string;
  linea                 : ISopDetalle[];

}

export interface ISopDetalle {
  id                    : number;
  line                  : number;
  docEntry              : number;
  lineNum               : number;
  order                 : number;
  docNum                : number;
  docDate               : Date;
  codTipDocumento       : string;
  nomTipDocumento       : string;
  cardCode              : string;
  cardName              : string;
  codOriCliente         : string;
  nomOriCliente         : string;
  slpCode               : number;
  slpName               : string;
  itemCode              : string;
  itemName              : string;
  codLinNegocio         : string;
  nomLinNegocio         : string;
  codGpoArticulo        : number;
  nomGpoArticulo        : string;
  salUnitMsr            : string;
  stock                 : number;
  qtyEarring            : number;
  pesoPromedioKg        : number;
  kgEarring             : number;
  price                 : number;
  lineTotEarring        : number;
  codConPago            : number;
  nomConPago            : string;
  fecEntFinal           : Date;
  fecEntProdProceso     : Date;
  record                : number;
  idUsuarioCreate       : number;
  idUsuarioUpdate?      : number;
}
