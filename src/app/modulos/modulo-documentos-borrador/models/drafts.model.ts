export class DraftsCreateModel {
  docEntry            : number;

  constructor(){
    this.docEntry            = 0;

  }
}

export class DraftsUpdateModel {
  docEntry            : number;

  docDate             : Date;
  docDueDate          : Date;
  taxDate             : Date;

  docType             : string;

  cardCode            : string;
  cardName            : string;
  cntctCode           : number;
  numAtCard           : string;
  docCur              : string;
  docRate             : number;

  payToCode           : string;
  address             : string;
  shipToCode          : string;
  address2            : string;

  groupNum            : number;

  // Código de Agencia
  u_BPP_MDCT          : string;
  // RUC de agencia
  u_BPP_MDRT          : string;
  // Nombre de agencia
  u_BPP_MDNT          : string;
  // Código de dirección de agencia
  u_FIB_CODT          : string;
  // Dirección de agencia
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

  discPrcnt           : number;
  discSum             : number;
  vatSum              : number;
  docTotal            : number;

  u_UsrUpdate         : number;

  lines               : Drafts1UpdateModel[];

  constructor(){
    this.docEntry            = 0;

    this.docDate             = null;
    this.docDueDate          = null;
    this.taxDate             = null;

    this.docType             = '';

    this.cardCode            = '';
    this.cardName            = '';
    this.cntctCode           = 0;
    this.numAtCard           = '';
    this.docCur              = '';
    this.docRate             = 0;

    this.payToCode           = '';
    this.address             = '';
    this.shipToCode          = '';
    this.address2            = '';

    this.groupNum            = 0;

    this.u_BPP_MDCT          = '';
    this.u_BPP_MDRT          = '';
    this.u_BPP_MDNT          = '';
    this.u_FIB_CODT          = '';
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

    this.u_UsrUpdate         = 0;

    this.lines               = [];
  }
}

export class Drafts1UpdateModel {
  lineStatus          : string;
  lineNum             : number;

  itemCode            : string;
  dscription          : string;
  acctCode            : string;
  whsCode             : string;

  unitMsr             : string;
  quantity            : number;

  currency            : string;
  priceBefDi          : number;
  discPrcnt           : number;
  price               : number;

  taxCode             : string;
  lineTotal           : number;

  u_FIB_LinStPkg      : string;
  u_FIB_OpQtyPkg      : number;
  u_tipoOpT12         : string;

  record              : number;

  constructor(){
    this.lineStatus          = '';
    this.lineNum             = 0;

    this.itemCode            = '';
    this.dscription          = '';
    this.acctCode            = '';
    this.whsCode             = '';

    this.unitMsr             = '';
    this.quantity            = 0;

    this.currency            = '';
    this.priceBefDi          = 0;
    this.discPrcnt           = 0;
    this.price               = 0;

    this.taxCode             = '';
    this.lineTotal           = 0;

    this.u_FIB_LinStPkg      = '';
    this.u_FIB_OpQtyPkg      = 0;
    this.u_tipoOpT12         = '';

    this.record              = 0;
  }
}



export class DraftsFilterModel {
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


export class DraftsDocumentReportFilterModel {
  user                        : string;
  pending                     : boolean;
  draftDate                   : string;
  startDate                   : Date;
  endDate                     : Date;
  orders                      : boolean;

  constructor(){
    this.user                 = '';
    this.pending              = false;
    this.draftDate            = '';
    this.startDate            = null;
    this.endDate              = null;
    this.orders               = false;
  }
}
