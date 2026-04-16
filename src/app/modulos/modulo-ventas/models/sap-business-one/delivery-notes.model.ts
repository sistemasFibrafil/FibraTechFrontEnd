import { StockTransferPickingUpdateModel } from "src/app/modulos/modulo-inventario/models/picking.model";

export class DeliveryNotesCreateModel {
  docDate                         : Date;
  docDueDate                      : Date;
  taxDate                         : Date;
  docType                         : string;

  u_BPP_MDTD                      : string;
  u_BPP_MDSD                      : string;
  u_BPP_MDCD                      : string;

  // SOCIO DE NEGOCIO
  cardCode                        : string;
  cardName                        : string;
  cntctCode                       : number;
  numAtCard                       : string;
  docCur                          : string;
  docRate                         : number;

  // LOGISTICA
  payToCode                       : string;
  address                         : string;
  shipToCode                      : string;
  address2                        : string;

  // FINANZAS
  groupNum                        : number;

  // AGENCIA
  u_BPP_MDCT                      : string;
  u_BPP_MDRT                      : string;
  u_BPP_MDNT                      : string;
  u_FIB_CODT                      : string;
  u_BPP_MDDT                      : string;

  // TRANSPORTISTA
  u_FIB_TIP_TRANS                 : string;
  u_FIB_COD_TRA                   : string;
  u_FIB_TIPDOC_TRA                : string;
  u_FIB_RUC_TRANS2                : string;
  u_FIB_TRANS2                    : string;
  u_BPP_MDVC                      : string;

  u_FIB_TIPDOC_COND               : string;
  u_FIB_NUMDOC_COD                : string;
  u_FIB_NOM_COND                  : string;
  u_FIB_APE_COND                  : string;
  u_BPP_MDFN                      : string;
  u_BPP_MDFC                      : string;

  // EXPORTACION
  u_RUCDestInter                  : string;
  u_DestGuiaInter                 : string;
  u_DireccDestInter               : string;
  u_STR_NCONTENEDOR               : string;
  u_STR_NPRESCINTO                : string;
  u_FIB_NPRESCINTO2               : string;
  u_FIB_NPRESCINTO3               : string;
  u_FIB_NPRESCINTO4               : string;

  // OTROS
  u_STR_TVENTA                    : string;
  u_BPP_MDMT                      : string;
  u_BPP_MDOM                      : string;

  // SALES EMPOYEE
  slpCode                         : number;

  u_FIB_NBULTOS                   : number;
  u_FIB_KG                        : number;

  u_NroOrden?                     : string;
  u_OrdenCompra?                  : string;

  comments                        : string;

  // TOTALES
  discPrcnt                       : number;
  docTotal                        : number;

  u_UsrCreate                     : number;

  lines                           : DeliveryNotes1CreateModel[];
  pickingLines                    : StockTransferPickingUpdateModel[];


  constructor(){
    this.docDate                  = null;
    this.docDueDate               = null;
    this.taxDate                  = null;
    this.docType                  = '';

    this.u_BPP_MDTD               = '';
    this.u_BPP_MDSD               = '';
    this.u_BPP_MDCD               = '';

    // SOCIO DE NEGOCIO
    this.cardCode                 = '';
    this.cardName                 = '';
    this.cntctCode                = 0;
    this.numAtCard                = '';
    this.docCur                   = '';
    this.docRate                  = 0;

    // LOGISTICA
    this.payToCode                = '';
    this.address                  = '';
    this.shipToCode               = '';
    this.address2                 = '';

    // FINANZAS
    this.groupNum                 = 0;

    // AGENCIA
    this.u_BPP_MDCT               = '';
    this.u_BPP_MDRT               = '';
    this.u_BPP_MDNT               = '';
    this.u_FIB_CODT               = '';
    this.u_BPP_MDDT               = '';

    // TRANSPORTISTA
    this.u_FIB_TIP_TRANS          = '';
    this.u_FIB_COD_TRA            = '';
    this.u_FIB_TIPDOC_TRA         = '';
    this.u_FIB_RUC_TRANS2         = '';
    this.u_FIB_TRANS2             = '';
    this.u_BPP_MDVC               = '';

    this.u_FIB_TIPDOC_COND        = '';
    this.u_FIB_NUMDOC_COD         = '';
    this.u_FIB_NOM_COND           = '';
    this.u_FIB_APE_COND           = '';
    this.u_BPP_MDFN               = '';
    this.u_BPP_MDFC               = '';

    // EXPORTACION
    this.u_RUCDestInter           = '';
    this.u_DestGuiaInter          = '';
    this.u_DireccDestInter        = '';
    this.u_STR_NCONTENEDOR        = '' ;
    this.u_STR_NPRESCINTO         = '';
    this.u_FIB_NPRESCINTO2        = '';
    this.u_FIB_NPRESCINTO3        = '';
    this.u_FIB_NPRESCINTO4        = '';

    // OTROS
    this.u_STR_TVENTA             = '';
    this.u_BPP_MDMT               = '';
    this.u_BPP_MDOM               = '';

    // SALES EMPOYEE
    this.slpCode                  = 0;

    this.u_FIB_NBULTOS            = 0;
    this.u_FIB_KG                 = 0;

    this.u_NroOrden               = '';
    this.u_OrdenCompra            = '';

    this.comments                 = '';

    // TOTALES
    this.discPrcnt                = 0;
    this.docTotal                 = 0;

    this.u_UsrCreate              = 0;

    this.lines                    = [];
    this.pickingLines             = [];
  }
}

export class DeliveryNotes1CreateModel {
  baseEntry?                      : number;
  baseType?                       : number;
  baseLine?                       : number;

  itemCode                        : string;
  dscription                      : string;
  acctCode?                       : string;
  whsCode                         : string;

  unitMsr                         : string;
  quantity                        : number;

  currency                        : string;
  priceBefDi                      : number;
  discPrcnt                       : number;
  price                           : number;

  taxCode                         : string;
  lineTotal                       : number;

  u_FIB_FromPkg?                  : string;
  u_FIB_NBulto?                   : number;
  u_FIB_PesoKg?                   : number;
  u_tipoOpT12                     : string;

  constructor(){
    this.baseEntry                = 0;
    this.baseType                 = 0;
    this.baseLine                 = 0;

    this.itemCode                 = '';
    this.dscription               = '';
    this.acctCode                 = '';
    this.whsCode                  = '';

    this.unitMsr                  = '';
    this.quantity                 = 0;

    this.currency                 = '';
    this.priceBefDi               = 0;
    this.discPrcnt                = 0;
    this.price                    = 0;

    this.taxCode                  = '';
    this.lineTotal                = 0;

    this.u_FIB_FromPkg            = '';
    this.u_FIB_NBulto             = 0;
    this.u_FIB_PesoKg             = 0;
    this.u_tipoOpT12              = '';
  }
}

export class DeliveryNotesUpdateModel {
  docEntry                        : number;

  docDueDate                      : Date;
  docType                         : string;

  u_BPP_MDTD                      : string;
  u_BPP_MDSD                      : string;
  u_BPP_MDCD                      : string;

  // SOCIO DE NEGOCIO
  cardCode                        : string;
  cntctCode                       : number;
  numAtCard                       : string;

  // LOGISTICA
  payToCode                       : string;
  address                         : string;

  // FINANZAS
  groupNum                        : number;

  // AGENCIA
  u_BPP_MDCT                      : string;
  u_BPP_MDRT                      : string;
  u_BPP_MDNT                      : string;
  u_FIB_CODT                      : string;
  u_BPP_MDDT                      : string;

  // TRANSPORTISTA
  u_FIB_TIP_TRANS?                : string;
  u_FIB_COD_TRA                   : string;
  u_FIB_TIPDOC_TRA?               : string;
  u_FIB_RUC_TRANS2                : string;
  u_FIB_TRANS2                    : string;
  u_BPP_MDVC                      : string;
  u_FIB_TIPDOC_COND?              : string;
  u_FIB_NUMDOC_COD                : string;
  u_FIB_NOM_COND                  : string;
  u_FIB_APE_COND                  : string;
  u_BPP_MDFN                      : string;
  u_BPP_MDFC                      : string;

  // EXPORTACION
  u_RUCDestInter                  : string;
  u_DestGuiaInter                 : string;
  u_DireccDestInter               : string;
  u_STR_NCONTENEDOR               : string;
  u_STR_NPRESCINTO                : string;
  u_FIB_NPRESCINTO2               : string;
  u_FIB_NPRESCINTO3               : string;
  u_FIB_NPRESCINTO4               : string;

  // OTROS
  u_STR_TVENTA                    : string;
  u_BPP_MDMT                      : string;
  u_BPP_MDOM                      : string;

  // SALES EMPOYEE
  slpCode                         : number;
  u_FIB_NBULTOS                   : number;
  u_FIB_KG                        : number;
  u_NroOrden?                     : string;
  u_OrdenCompra?                  : string;
  comments                        : string;

  u_UsrUpdate                     : number;

  constructor(){
    this.docEntry                 = 0;

    this.docDueDate               = null;
    this.docType                  = '';

    this.u_BPP_MDTD               = '';
    this.u_BPP_MDSD               = '';
    this.u_BPP_MDCD               = '';

    // SOCIO DE NEGOCIO
    this.cardCode                 = '';
    this.cntctCode                = 0;
    this.numAtCard                = '';

    // LOGISTICA
    this.payToCode                = '';
    this.address                  = '';

    // FINANZAS
    this.groupNum                 = 0;

    // AGENCIA
    this.u_BPP_MDCT               = '';
    this.u_BPP_MDRT               = '';
    this.u_BPP_MDNT               = '';
    this.u_FIB_CODT               = '';
    this.u_BPP_MDDT               = '';

    // TRANSPORTISTA
    this.u_FIB_TIP_TRANS          = '';
    this.u_FIB_COD_TRA            = '';
    this.u_FIB_TIPDOC_TRA         = '';
    this.u_FIB_RUC_TRANS2         = '';
    this.u_FIB_TRANS2             = '';
    this.u_BPP_MDVC               = '';

    this.u_FIB_TIPDOC_COND        = '';
    this.u_FIB_NUMDOC_COD         = '';
    this.u_FIB_NOM_COND           = '';
    this.u_FIB_APE_COND           = '';
    this.u_BPP_MDFN               = '';
    this.u_BPP_MDFC               = '';

    // EXPORTACION
    this.u_RUCDestInter           = '';
    this.u_DestGuiaInter          = '';
    this.u_DireccDestInter        = '';
    this.u_STR_NCONTENEDOR        = '' ;
    this.u_STR_NPRESCINTO         = '';
    this.u_FIB_NPRESCINTO2        = '';
    this.u_FIB_NPRESCINTO3        = '';
    this.u_FIB_NPRESCINTO4        = '';

    // OTROS
    this.u_STR_TVENTA             = '';
    this.u_BPP_MDMT               = '';
    this.u_BPP_MDOM               = '';

    // SALES EMPOYEE
    this.slpCode                  = 0;

    this.u_FIB_NBULTOS            = 0;
    this.u_FIB_KG                 = 0;

    this.u_NroOrden               = '';
    this.u_OrdenCompra            = '';

    this.comments                 = '';

    this.u_UsrUpdate              = 0;
  }
}

export class DeliveryNotesFilterModel {
  startDate                   : Date;
  endDate                     : Date;
  docStatus                   : string;
  searchText                  : string;

  constructor(){
    this.startDate            = null;
    this.endDate              = null;
    this.docStatus            = '';
    this.searchText           = '';
  }
}

export class DeliveryNotesCloseModel {
  docEntry                   : number;
  u_UsrClose                 : number;

  constructor(){
    this.docEntry             = 0;
    this.u_UsrClose           = 0;
  }
}

export class DeliveryNotesCancelModel {
  docEntry                   : number;
  u_UsrCreate                : number;
  u_UsrCancel                : number;

  constructor(){
    this.docEntry             = 0;
    this.u_UsrCreate          = 0;
    this.u_UsrCancel          = 0;
  }
}


