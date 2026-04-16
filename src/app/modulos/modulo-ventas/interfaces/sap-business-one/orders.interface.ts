import { IMoneda } from "src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/finanzas/moneda.interface";
import { IPicking } from "src/app/modulos/modulo-inventario/interfaces/picking.inteface";
import { IAddresses } from "src/app/modulos/modulo-socios-negocios/interfaces/addresses.interface";

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
  groupCode           : number;
  cntctCode?          : number;
  numAtCard           : string;
  docCur              : string;
  currencyList        : IMoneda[];
  docRate             : number;

  payToCode           : string;
  payAddressList      : IAddresses[];
  address             : string;
  shipToCode          : string;
  shipAddressList     : IAddresses[];
  address2            : string;

  groupNum            : number;

  u_BPP_MDCT          : string;
  u_BPP_MDRT          : string;
  u_BPP_MDNT          : string;
  u_FIB_CODT          : string;
  agencyAddressList   : IAddresses[];
  u_BPP_MDDT          : string;


  u_TipoFlete         : string;
  u_ValorFlete        : number;
  u_FIB_TFLETE        : number;
  u_FIB_IMPSEG        : number;
  u_FIB_PUERTO        : string;

  u_STR_TVENTA        : string;

  slpCode             : number;
  u_NroOrden?         : string;
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
  currency            : string;
  priceBefDi          : number;
  discPrcnt           : number;
  price               : number;
  taxCode             : string;
  vatPrcnt            : number;
  vatSum              : number;
  lineTotal           : number;

  u_FIB_LinStPkg      : string;
  u_FIB_OpQtyPkg      : number;
  u_tipoOpT12         : string;
  u_tipoOpT12Nam      : string;
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

export interface IOrdersSeguimiento {
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


export interface IOrdersSeguimientoDetallado {
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


export interface IOrdersPendiente {
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

export interface IOrdersSodimacPendiente
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


export interface IOrdersOpenQuery {
  docEntry            : number;
  docNum              : number;
  WhsCode             : string;
}

export interface IOrdersQuery {
  docEntry            : number;
  docNum              : number;
  objType             : string;
  docType             : string;
  canceled            : string;
  docStatus           : string;
  wddStatus           : string;

  docDate             : Date;
  docDueDate          : Date;
  taxDate             : Date;

  u_FIB_DocStPkg      : string;
  u_FIB_IsPkg         : string;

  cardCode            : string;
  licTradNum          : string;
  cardName            : string;
  groupCode           : number;
  cntctCode?          : number;
  numAtCard           : string;
  docCur              : string;
  currencyList        : IMoneda[];
  docRate             : number;

  payToCode           : string;
  payAddressList      : IAddresses[];
  address             : string;
  shipToCode          : string;
  shipAddressList     : IAddresses[];
  address2            : string;

  groupNum            : number;

  u_BPP_MDCT          : string;
  u_BPP_MDRT          : string;
  u_BPP_MDNT          : string;
  u_FIB_CODT          : string;
  agencyAddressList   : IAddresses[];
  u_BPP_MDDT          : string;

  u_TipoFlete         : string;
  u_ValorFlete        : number;
  u_FIB_TFLETE        : number;
  u_FIB_IMPSEG        : number;
  u_FIB_PUERTO        : string;

  u_STR_TVENTA        : string;

  slpCode             : number;
  slpName             : string;
  u_FIB_NBULTOS       : number;
  u_FIB_KG            : number;
  u_NroOrden?         : string;
  u_OrdenCompra?      : string;
  comments            : string;

  subTotal            : number;
  discPrcnt           : number;
  discSum             : number;
  vatSum              : number;
  docTotal            : number;

  lines               : IOrdenVenta1Query[];
  pickingLines        : IPicking[];
}

export interface IOrdenVenta1Query {
  docEntry?           : number;
  lineNum?            : number;
  lineStatus?         : string;

  baseEntry?          : number;
  baseType?           : number;
  baseLine?           : number;

  u_FIB_FromPkg?      : string;

  itemCode            : string;
  dscription          : string;
  acctCode?           : string;
  formatCode?         : string;
  acctName?           : string;
  whsCode             : string;


  unitMsr             : string;
  onHand?             : number;
  quantity            : number;
  openQty             : number;
  u_FIB_OpQtyPkg?     : number;
  u_FIB_NBulto?       : number;
  u_FIB_PesoKg?       : number;

  currency            : string;
  priceBefDi          : number;
  discPrcnt           : number;
  price               : number;
  taxCode             : string;
  vatPrcnt?           : number;
  vatSum?             : number;
  lineTotal?          : number;

  u_FIB_LinStPkg?     : string;
  u_tipoOpT12         : string;
  u_tipoOpT12Nam      : string;
  record?             : number;
}
