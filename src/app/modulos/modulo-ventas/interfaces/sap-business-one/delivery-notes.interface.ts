import { IMoneda } from "src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/finanzas/moneda.interface";
import { IPicking } from "src/app/modulos/modulo-inventario/interfaces/picking.inteface";
import { IAddresses } from "src/app/modulos/modulo-socios-negocios/interfaces/addresses.interface";


export interface IDeliveryNotes {
  docEntry            : number;
  docNum              : number;
  objType             : string;
  docType             : string;
  docStatus           : string;
  u_BPP_MDTD          : string;
  u_BPP_MDSD          : string;
  u_BPP_MDCD          : string;

  docDate             : Date;
  docDueDate          : Date;
  taxDate             : Date;

  // SOCIO DE NEGOCIO
  cardCode            : string;
  cardName            : string;
  groupCode           : number;
  cntctCode?          : number;
  numAtCard           : string;
  docCur              : string;
  currencyList        : IMoneda[];
  docRate             : number;

  // LOGISTICA
  payToCode           : string;
  payAddressList      : IAddresses[];
  address             : string;
  shipToCode          : string;
  shipAddressList     : IAddresses[];
  address2            : string;

  // FINANZAS
  groupNum            : number;

  // AGENCIA
  u_BPP_MDCT          : string;
  u_BPP_MDRT          : string;
  u_BPP_MDNT          : string;
  u_FIB_CODT          : string;
  agencyAddressList   : IAddresses[];
  u_BPP_MDDT          : string;

  // TRANSPORTISTA
  u_FIB_TIP_TRANS     : string;
  u_FIB_COD_TRA       : string;
  u_FIB_TIPDOC_TRA    : string;
  u_FIB_RUC_TRANS2    : string;
  u_FIB_TRANS2        : string;
  u_BPP_MDVC          : string;
  u_FIB_TIPDOC_COND   : string;
  u_FIB_NUMDOC_COD    : string;
  u_FIB_NOM_COND      : string;
  u_FIB_APE_COND      : string;
  u_BPP_MDFN          : string;
  u_BPP_MDFC          : string;

  // EXPORTACION
  u_RUCDestInter      : string;
  u_DestGuiaInter     : string;
  u_DireccDestInter   : string;
  u_STR_NCONTENEDOR   : string;
  u_STR_NPRESCINTO    : string;
  u_FIB_NPRESCINTO2   : string;
  u_FIB_NPRESCINTO3   : string;
  u_FIB_NPRESCINTO4   : string;

  // OTROS
  u_STR_TVENTA        : string;
  u_BPP_MDMT          : string;
  u_BPP_MDOM          : string;

  // SALES EMPOYEE
  slpCode             : number;
  u_FIB_NBULTOS       : number;
  u_FIB_KG            : number;
  u_OrdenCompra?      : string;
  comments            : string;

  // TOTALES
  subTotal            : number;
  discPrcnt           : number;
  discSum             : number;
  vatSum              : number;
  docTotal            : number;
}

export interface IDeliveryNotesQuery {
  docEntry            : number;
  docNum              : number;
  objType             : string;
  docType             : string;
  canceled            : string;
  docStatus           : string;
  u_BPP_MDTD          : string;
  u_BPP_MDSD          : string;
  u_BPP_MDCD          : string;

  docDate             : Date;
  docDueDate          : Date;
  taxDate             : Date;

  // SOCIO DE NEGOCIO
  cardCode            : string;
  cardName            : string;
  groupCode           : number;
  groupName           : string;
  cntctCode?          : number;
  numAtCard           : string;
  docCur              : string;
  currencyList        : IMoneda[];
  docRate             : number;

  // FINANZAS
  groupNum            : number;

  // LOGISTICA
  payToCode           : string;
  payAddressList      : IAddresses[];
  address             : string;
  shipToCode          : string;
  shipAddressList     : IAddresses[];
  address2            : string;

  // AGENCIA
  u_BPP_MDCT          : string;
  u_BPP_MDRT          : string;
  u_BPP_MDNT          : string;
  u_FIB_CODT          : string;
  agencyAddressList   : IAddresses[];
  u_BPP_MDDT          : string;

  // TRANSPORTISTA
  u_FIB_TIP_TRANS     : string;
  u_FIB_COD_TRA       : string;
  u_FIB_TIPDOC_TRA    : string;
  u_FIB_RUC_TRANS2    : string;
  u_FIB_TRANS2        : string;
  u_BPP_MDVC          : string;
  u_FIB_TIPDOC_COND   : string;
  u_FIB_NUMDOC_COD    : string;
  u_FIB_NOM_COND      : string;
  u_FIB_APE_COND      : string;
  u_BPP_MDFN          : string;
  u_BPP_MDFC          : string;

  // EXPORTACION
  u_RUCDestInter      : string;
  u_DestGuiaInter     : string;
  u_DireccDestInter   : string;
  u_STR_NCONTENEDOR   : string;
  u_STR_NPRESCINTO    : string;
  u_FIB_NPRESCINTO2   : string;
  u_FIB_NPRESCINTO3   : string;
  u_FIB_NPRESCINTO4   : string;

  // OTROS
  u_STR_TVENTA        : string;
  u_BPP_MDMT          : string;
  u_BPP_MDOM          : string;

  // SALES EMPOYEE
  slpCode             : number;
  slpName             : string;
  u_FIB_NBULTOS       : number;
  u_FIB_KG            : number;
  u_NroOrden?         : string;
  u_OrdenCompra?      : string;
  comments            : string;

  // TOTALES
  subTotal            : number;
  discPrcnt           : number;
  discSum             : number;
  vatSum              : number;
  docTotal            : number;

  lines               : IDeliveryNotes1Query[];
  pickingLines        : IPicking[];
}

export interface IDeliveryNotes1Query {
  docEntry            : number;
  objType?            : string;
  lineNum             : number;
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
  onHand              : number;
  quantity            : number;
  openQty             : number;
  u_FIB_OpQtyPkg?     : number;
  u_FIB_PesoKg?       : number;
  u_FIB_NBulto?       : number;

  currency            : string;
  priceBefDi          : number;
  discPrcnt           : number;
  price               : number;
  taxCode             : string;
  u_tipoOpT12         : string;
  u_tipoOpT12Nam      : string;
  vatPrcnt?           : number;
  vatSum?             : number;
  lineTotal?          : number;
  record              : number;
}
