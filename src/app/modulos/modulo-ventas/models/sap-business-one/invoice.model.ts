export class InvoiceCreateModel {
  docDate                         : Date;
  docDueDate                      : Date;
  taxDate                         : Date;
  reserveInvoice                  : string;
  docType                         : string;

  u_BPP_MDTD                      : string;
  u_BPP_MDSD                      : string;
  u_BPP_MDCD                      : string;

  u_FIB_IsPkg                     : string;

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

  // EXPORTACION
  u_TipoFlete                     : string;
  u_ValorFlete                    : number;
  u_FIB_TFLETE                    : number;
  u_FIB_IMPSEG                    : number;
  u_FIB_PUERTO                    : string;

  // OTROS
  u_STR_TVENTA                    : string;

  // SALES EMPOYEE
  slpCode                         : number;
  u_NroOrden?                     : string;
  u_OrdenCompra?                  : string;
  comments                        : string;

  // TOTALES
  discPrcnt                       : number;
  docTotal                        : number;

  u_UsrCreate                     : number;

  lines                           : Invoice1CreateModel[];


  constructor(){
    this.docDate                  = null;
    this.docDueDate               = null;
    this.taxDate                  = null;
    this.reserveInvoice           = '';
    this.docType                  = '';

    this.u_BPP_MDTD               = '';
    this.u_BPP_MDSD               = '';
    this.u_BPP_MDCD               = '';
    
    this.u_FIB_IsPkg              = '';

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

    // EXPORTACION
    this.u_TipoFlete              = '';
    this.u_ValorFlete             = 0;
    this.u_FIB_TFLETE             = 0;
    this.u_FIB_IMPSEG             = 0;
    this.u_FIB_PUERTO             = '';
    // OTROS
    this.u_STR_TVENTA             = '';

    // SALES EMPOYEE
    this.slpCode                  = -1;
    this.u_NroOrden              = '';
    this.u_OrdenCompra            = '';
    this.comments                 = '';
    // TOTALES
    this.discPrcnt                = 0;
    this.docTotal                 = 0;

    this.u_UsrCreate              = 0;

    this.lines                    = [];
  }
}

export class Invoice1CreateModel {
  baseEntry?                      : number;
  baseType?                       : number;
  baseLine?                       : number;

  itemCode                        : string;
  dscription                      : string;
  acctCode?                       : string;
  formatCode?                     : string;
  acctName?                       : string;
  whsCode                         : string;

  unitMsr                         : string;
  quantity                        : number;

  currency                        : string;
  priceBefDi                      : number;
  discPrcnt                       : number;
  price                           : number;
  taxCode                         : string;

  u_FIB_OpQtyPkg?                 : number;
  u_tipoOpT12                     : string;

  lineTotal?                      : number;

  constructor(){
    this.baseEntry                = 0;
    this.baseType                 = 0;
    this.baseLine                 = 0;

    this.itemCode                 = '';
    this.dscription               = '';
    this.acctCode                 = '';
    this.formatCode               = '';
    this.acctName                 = '';
    this.whsCode                  = '';

    this.unitMsr                  = '';
    this.quantity                 = 0;

    this.currency                 = '';
    this.priceBefDi               = 0;
    this.discPrcnt                = 0;
    this.price                    = 0;

    this.taxCode                  = '';
    this.lineTotal                = 0;

    this.u_FIB_OpQtyPkg           = 0;
    this.u_tipoOpT12              = '';
  }
}

export class InvoiceUpdateModel {
  docEntry                        : number;
  docDueDate                      : Date;
  reserveInvoice                  : string;
  docType                         : string;

  u_BPP_MDTD                      : string;
  u_BPP_MDSD                      : string;
  u_BPP_MDCD                      : string;

  // SOCIO DE NEGOCIO
  cardCode                        : string;
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

  // EXPORTACION
  u_TipoFlete                     : string;
  u_ValorFlete                    : number;
  u_FIB_TFLETE                    : number;
  u_FIB_IMPSEG                    : number;
  u_FIB_PUERTO                    : string;

  // OTROS
  u_STR_TVENTA                    : string;

  // SALES EMPOYEE
  slpCode                         : number;
  u_NroOrden?                     : string;
  u_OrdenCompra?                  : string;
  comments                        : string;

  u_UsrUpdate                     : number;


  constructor(){
    this.docEntry                 = 0;
    this.docDueDate               = null;
    this.reserveInvoice           = '';
    this.docType                  = '';

    this.u_BPP_MDTD               = '';
    this.u_BPP_MDSD               = '';
    this.u_BPP_MDCD               = '';

    // SOCIO DE NEGOCIO
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

    // EXPORTACION
    this.u_TipoFlete              = '';
    this.u_ValorFlete             = 0;
    this.u_FIB_TFLETE             = 0;
    this.u_FIB_IMPSEG             = 0;
    this.u_FIB_PUERTO             = '';

    // OTROS
    this.u_STR_TVENTA             = '';

    // SALES EMPOYEE
    this.slpCode                  = -1;
    this.u_NroOrden              = '';
    this.u_OrdenCompra            = '';
    this.comments                 = '';

    this.u_UsrUpdate              = 0;
  }
}

export class InvoicesCancelModel {
  docEntry                    : number;
  u_UsrCreate                 : number;
  u_UsrCancel                 : number;

  constructor(){
    this.docEntry             = 0;
    this.u_UsrCreate          = 0;
    this.u_UsrCancel          = 0;
  }
}


export class InvoiceFilterModel {
  startDate                   : Date;
  endDate                     : Date;
  docStatus                   : string;
  docSubType                  : string;
  isIns                       : string;
  searchText                  : string;

  constructor(){
    this.startDate            = null;
    this.endDate              = null;
    this.docStatus            = '';
    this.docSubType           = '';
    this.isIns                = '';
    this.searchText           = '';
  }
}
