
export class OrdenVentaCreateModel {
  docDate             : Date;
  docDueDate          : Date;
  taxDate             : Date;

  docType             : string;

  u_FIB_DocStPkg      : string;
  u_FIB_IsPkg         : string;

  cardCode            : string;
  licTradNum          : string;
  cardName            : string;
  cntctCode           : number;
  docCur              : string;
  docRate             : number;
  numAtCard           : string;

  shipToCode          : string;
  address2            : string;
  payToCode           : string;
  address             : string;

  groupNum            : number;

  // Código de Agencia
  u_BPP_MDCT          : string;
  // RUC de agencia
  u_BPP_MDRT          : string;
  // Nombre de agencia
  u_BPP_MDNT          : string;
  // Código de dirección de agencia
  u_FIB_AgencyToCode  : string;
  // Dirección de agencia
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

  discPrcnt           : number;
  discSum             : number;
  vatSum              : number;
  docTotal            : number;

  u_UsrCreate         : number;

  lines               : OrdenVenta1CreateModel[];

  constructor(){
    this.docDate             = null;
    this.docDueDate          = null;
    this.taxDate             = null;

    this.cardCode            = '';
    this.licTradNum          = '';
    this.cardName            = '';
    this.cntctCode           = 0;
    this.docCur              = '';
    this.docRate             = 0;

    this.shipToCode          = '';
    this.address2            = '';
    this.payToCode           = '';
    this.address             = '';

    this.groupNum            = 0;

    this.u_BPP_MDCT          = '';
    this.u_BPP_MDRT          = '';
    this.u_BPP_MDNT          = '';
    this.u_FIB_AgencyToCode  = '';
    this.u_BPP_MDDT          = '';

    this.u_TipoFlete         = '';
    this.u_ValorFlete        = 0;
    this.u_FIB_TFLETE        = 0;
    this.u_FIB_IMPSEG        = 0;
    this.u_FIB_PUERTO        = '';

    this.u_STR_TVENTA        = '';

    this.slpCode             = 0;
    this.u_OrdenCompra       = '';
    this.comments            = '';

    this.discPrcnt           = 0;
    this.discSum             = 0;
    this.vatSum              = 0;
    this.docTotal            = 0;

    this.lines               = [];
  }
}

export class OrdenVenta1CreateModel {
  itemCode            : string;
  dscription          : string;
  whsCode             : string;
  u_tipoOpT12         : string;
  unitMsr             : string;
  quantity            : number;
  u_FIB_OpQtyPkg      : number;
  currency            : string;
  priceBefDi          : number;
  discPrcnt           : number;
  price               : number;
  taxCode             : string;
  vatPrcnt            : number;
  vatSum              : number;
  lineTotal           : number;

  constructor(){
    this.itemCode            = '';
    this.dscription          = '';
    this.u_tipoOpT12         = '';
    this.whsCode             = '';
    this.unitMsr             = '';
    this.quantity            = 0;
    this.currency            = '';
    this.priceBefDi          = 0;
    this.discPrcnt           = 0;
    this.price               = 0;
    this.taxCode             = '';
    this.vatPrcnt            = 0;
    this.vatSum              = 0;
    this.lineTotal           = 0;
  }
}


export class OrdenVentaUpdateModel {
  idOrdenVenta        : number;
  numero              : string;
  docNum              : number;
  docStatus           : string;
  docStatusRd         : string;
  docDate             : Date;
  docDueDate          : Date;
  taxDate             : Date;

  cardCode            : string;
  licTradNum          : string;
  cardName            : string;
  cntctCode           : number;
  payToCode           : string;
  address             : string;
  shipToCode          : string;
  address2            : string;
  numOrdCom?          : string;
  docCur              : string;
  docRate             : number;
  groupNum            : number;

  u_BPP_MDCT          : string;
  u_BPP_MDRT          : string;
  u_BPP_MDNT          : string;
  codDirAgencia       : string;
  u_BPP_MDDT          : string;

  codTipFlete         : string;
  u_ValorFlete          : number;
  u_FIB_TFLETE          : number;
  u_FIB_IMPSEG       : number;
  puerto              : string;

  u_STR_TVENTA         : string;

  slpCode             : number;
  comments            : string;

  discPrcnt           : number;
  discSum             : number;
  vatSum              : number;
  docTotal            : number;

  linea               : OrdenVentaDetalleUpdateModel[];

  constructor(){
    this.idOrdenVenta        = 0;
    this.numero              = '';
    this.docNum              = 0;
    this.docStatus           = '';
    this.docStatusRd        = '';
    this.docDate             = null;
    this.docDueDate          = null;
    this.taxDate             = null;

    this.cardCode            = '';
    this.licTradNum          = '';
    this.cardName            = '';
    this.cntctCode           = 0;
    this.payToCode           = '';
    this.address             = '';
    this.shipToCode          = '';
    this.address2            = '';
    this.numOrdCom           = '';
    this.docCur              = '';
    this.docRate             = 0;
    this.groupNum            = 0;

    this.u_BPP_MDCT          = '';
    this.u_BPP_MDRT          = '';
    this.u_BPP_MDNT          = '';
    this.codDirAgencia       = '';
    this.u_BPP_MDDT          = '';

    this.codTipFlete         = '';
    this.u_ValorFlete          = 0;
    this.u_FIB_TFLETE          = 0;
    this.u_FIB_IMPSEG       = 0;
    this.puerto              = '';

    this.u_STR_TVENTA         = '';

    this.slpCode             = 0;
    this.comments            = '';

    this.discPrcnt           = 0;
    this.discSum             = 0;
    this.vatSum              = 0;
    this.docTotal            = 0;

    this.linea               = [];
  }
}

export class OrdenVentaDetalleUpdateModel {
  idOrdenVenta?       : number;
  line                : number;
  lineStatus          : string;
  lineStatusRd        : string;
  itemCode            : string;
  dscription          : string;
  whsCode             : string;
  unitMsr             : string;
  quantity            : number;
  openQty             : number;
  openQtyRd           : number;
  currency            : string;
  priceBefDi          : number;
  discPrcnt           : number;
  price               : number;
  lineTotal           : number;
  taxCode             : string;
  vatPrcnt            : number;
  vatSum              : number;

  constructor(){
    this.idOrdenVenta        = 0;
    this.line                = 0;
    this.lineStatus          = '';
    this.lineStatusRd        = '';
    this.itemCode            = '';
    this.dscription          = '';
    this.whsCode             = '';
    this.unitMsr             = '';
    this.quantity            = 0;
    this.openQty             = 0;
    this.openQtyRd          = 0;
    this.currency            = '';
    this.priceBefDi          = 0;
    this.discPrcnt           = 0;
    this.price               = 0;
    this.lineTotal           = 0;
    this.taxCode             = '';
    this.vatPrcnt            = 0;
    this.vatSum              = 0;
  }
}
