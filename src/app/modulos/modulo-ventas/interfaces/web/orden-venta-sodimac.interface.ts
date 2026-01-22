
export interface IOrdenVentaSodimac {
  id                        : number;
  docEntry                  : number;
  docNum                    : number;
  numOrdenCompra            : string;
  docStatus                 : string;
  docDate                   : Date;
  docDueDate                : Date;
  taxDate                   : Date;
  CardCode                  : string;
  CardName                  : string;
  cntctCode                 : number;
  cntctName                 : string;
  address                   : string;
  item                      : IOrdenVentaSodimacDetalle[];
}

export interface IOrdenVentaSodimacDetalle {
  id                        : number;
  line1                     : number;
  line2                     : number;
  numLocal                  : number;
  nomLocal                  : string;
  isOriente                 : boolean;
  lineStatus                : string;
  itemCode                  : string;
  sku                       : string;
  dscription                : string;
  dscriptionLarga           : string;
  ean                       : string;
  lpn?                      : string;
  quantity                  : number;
}

export interface IOrdenVentaSodimacByFiltro {
  id                        : number;
  docNum                    : number;
  numOrdenCompra            : string;
  docStatus                 : string;
  docDate                   : Date;
  docDueDate                : Date;
  taxDate                   : Date;
  CardCode                  : string;
  CardName                  : string;
}

export interface IOrdenVentaSodimacConsulta {
  id?                       : number;
  line1?                    : number;
  line2?                    : number;

  docNum?                   : number;
  numOrdenCompra?           : string;
  docDate?                  : Date;
  docDueDate?               : Date;
  taxDate?                  : Date;
  cardCode?                 : string;
  cardName?                 : string;

  numLocal                  : number;
  nomLocal                  : string;
  sku                       : string;
  dscription                : string;
  dscriptionLarga           : string;
  ean                       : string;
  lpn?                      : string;
  quantity                  : number;
}
