import { IMoneda } from "src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/finanzas/moneda.interface";
import { IPicking } from "src/app/modulos/modulo-inventario/interfaces/picking.inteface";
import { IAddresses } from "src/app/modulos/modulo-socios-negocios/interfaces/addresses.interface";

export interface IDrafts {
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

  lines               : IDraftsLine[];
}

export interface IDraftsLine {
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


export interface IDraftsItem {
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

export interface IDraftsQuery {
  docEntry            : number;
  docNum              : number;
  objType             : string;
  docType             : string;
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

  lines               : IDraftsLineQuery[];
  pickingLines        : IPicking[];
}

export interface IDraftsLineQuery {
  docEntry?           : number;
  lineNum?            : number;
  lineStatus          : string;

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
  u_FIB_OpQtyPkg      : number;
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

  u_FIB_LinStPkg      : string;
  u_tipoOpT12         : string;
  u_tipoOpT12Nam      : string;
  record              : number;
}

export interface IDraftsStatusQuery {
  docStatus           : string;
  wddStatus           : string;
}
