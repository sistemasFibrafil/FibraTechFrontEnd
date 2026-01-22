import { IMoneda } from "src/app/modulos/modulo-gestion/interfaces/sap/definiciones/finanzas/moneda.interface";
import { IDireccion } from "src/app/modulos/modulo-socios-negocios/interfaces/direccion.interface";

export interface IOrdenVenta {
  docEntry            : number;
  docNum              : number;
  objType             : string;
  docType             : string;
  docStatus           : string;

  docDate             : Date;
  docDueDate          : Date;
  taxDate             : Date;

  u_FIB_DocStPkg      : string;
  u_FIB_IsPkg         : string;

  cardCode            : string;
  licTradNum          : string;
  cardName            : string;
  cntctCode?          : number;
  numAtCard           : string;
  docCur              : string;
  currencyList        : IMoneda[];
  docRate             : number;

  groupNum            : number;

  payToCode           : string;
  payAddressList      : IDireccion[];
  address             : string;
  shipToCode          : string;
  shipAddressList     : IDireccion[];
  address2            : string;


  u_BPP_MDCT          : string;
  u_BPP_MDRT          : string;
  u_BPP_MDNT          : string;
  u_FIB_AgencyToCode  : string;
  agencyAddressList   : IDireccion[];
  u_BPP_MDDT          : string;


  u_TipoFlete         : string;
  u_ValorFlete        : number;
  u_FIB_TFLETE        : number;
  u_FIB_IMPSEG        : number;
  u_FIB_PUERTO        : string;

  u_STR_TVENTA        : string;

  slpCode             : number;
  u_OrdenCompra?      : string;
  comments            : string;

  subTotal            : number;
  discPrcnt           : number;
  discSum             : number;
  vatSum              : number;
  docTotal            : number;

  lines               : IOrdenVenta1[];
}

export interface IOrdenVenta1 {
  docEntry            : number;
  lineNum             : number;
  lineStatus          : string;
  itemCode            : string;
  dscription          : string;
  acctCode?           : string;
  formatCode?         : string;
  acctName?           : string;
  whsCode             : string;
  unitMsr             : string;
  onHand              : number;
  quantity            : number;
  openQty             : number;
  u_FIB_OpQtyPkg      : number;
  currency            : string;
  priceBefDi          : number;
  discPrcnt           : number;
  price               : number;
  taxCode             : string;
  u_tipoOpT12         : string;
  u_tipoOpT12Nam      : string;
  vatPrcnt            : number;
  vatSum              : number;
  lineTotal           : number;
  record              : number;
}




export interface IOrdenVentaItem {
  docEntry      : number;
  docNum        : number;
  objType       : number;
  lineNum       : number;
  itemCode      : string;
  itemName      : string;
  unidadMedida  : string;
  quantity      : number;
  peso          : number;
}

export interface IOrdenVentaSeguimientoByFecha {
  nomTipDocumento           : string;
  numeroDocumento           : number;
  docDate                   : Date;
  taxDate                   : Date;
  docDueDate                : Date;
  codStatus                 : string;
  nomStatus                 : string;
  cardCode                  : string;
  cardName                  : string;
  docTotal                  : number;
  docTotalFC                : number;
  docTotalSy                : number;
}


export interface IOrdenVentaSeguimientoDetallado {
  docEntry                  : number;
  lineNum                   : number;
  codTipDocumento           : string;
  nomTipDocumento           : string;
  numeroDocumento           : number;
  numeroPedido              : number;
  numeroFactura             : number;
  docDate                   : Date;
  taxDate                   : Date;
  docDueDate                : Date;
  codStatus                 : string;
  nomStatus                 : string;
  cardCode                  : string;
  cardName                  : string;
  codOriCliente             : string;
  nomOriCliente             : string;
  slpCode                   : number;
  slpName                   : string;
  codConPago                : number;
  nomConPago                : string;
  itemCode                  : string;
  itemName                  : string;
  codLinNegocio             : string;
  nomLinNegocio             : string;
  codGpoArticulo            : number;
  nomGpoArticulo            : string;
  whsCode                   : string;
  whsName                   : string;
  salUnitMsr                : string;
  stock                     : number;
  pendiente                 : number;
  solicitado                : number;
  disponible                : number;
  stockProduccion           : number;
  pendienteProduccion       : number;
  solicitadoProduccion      : number;
  disponibleProduccion      : number;
  quantity                  : number;
  rolloPedido               : number;
  peso                      : number;
  kgPedido                  : number;
  toneladaPedida            : number;
  openQty                   : number;
  rolloPendiente            : number;
  pesoPromedioKg            : number;
  kgPendiente               : number;
  toneladaPendiente         : number;
  delivrdQty                : number;
  price                     : number;
  lineTotEarring            : number;
  totalSumSy                : number;
  sede                      : string;
}


export interface IOrdenVentaPendienteByFecha {
  docEntry                  : number;
  nomTipDocumento           : string;
  numeroPedido              : number;
  numeroFactura?            : number;
  docDate                   : Date;
  taxDate                   : Date;
  docDueDate                : Date;
  cardCode                  : string;
  cardName                  : string;
  slpName                   : string;
  itemCode                  : string;
  itemName                  : string;
  whsCode                   : string;
  whsName                   : string;
  stock                     : number;
  pendiente                 : number;
  solicitado                : number;
  disponible                : number;
  stockProduccion           : number;
  pendienteProduccion       : number;
  solicitadoProduccion      : number;
  disponibleProduccion      : number;
  quantity                  : number;
  rolloPedido               : number;
  kgPedido                  : number;
  toneladaPedida            : number;
  openQty                   : number;
  rolloPendiente            : number;
  kgPendiente               : number;
  toneladaPendiente         : number;
  delivrdQty                : number;
  price                     : number;
  totalSumSy                : number;
}

export interface IOrdenVentaSapPendienteByFiltro
{
  docEntry                  : number;
  docNum                    : number;
  numOrdenCompra            : string;
  docDate                   : Date;
  docDueDate                : Date;
  taxDate                   : Date;
  cardCode                  : string;
  cardName                  : string;
  cntctCode                 : number;
  cntctName                 : string;
  address2                  : string;
}
