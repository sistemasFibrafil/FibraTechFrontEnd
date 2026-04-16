import { Attachments2CreateModel } from './attachments2.model';

export class OrdersCreateModel {
  docDate             : Date;
  docDueDate          : Date;
  taxDate             : Date;
  docType             : string;

  u_FIB_DocStPkg      : string;
  u_FIB_IsPkg         : string;

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

  u_UsrCreate         : number;

  attachments2        : Attachments2CreateModel;

  lines               : Orders1CreateModel[];

  constructor(){
    this.docDate             = null;
    this.docDueDate          = null;
    this.taxDate             = null;

    this.docType             = '';

    this.u_FIB_DocStPkg      = '';
    this.u_FIB_IsPkg         = '';

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

    this.lines               = [];
  }
}

export class Orders1CreateModel {
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

  constructor(){
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

    this.u_FIB_LinStPkg      = 'O';
    this.u_FIB_OpQtyPkg      = 0;
    this.u_tipoOpT12         = '';
  }
}


export class OrdersUpdateModel {
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

  lines               : Orders1UpdateModel[];

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

export class Orders1UpdateModel {
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


export class OrdersCloseModel {
  id                         : number;
  docEntry                    : number;
  idUsuarioClose              : number;

  constructor(){
    this.id                   = 0;
    this.docEntry             = 0;
    this.idUsuarioClose       = 0;
  }
}



export class OrdersFilterModel {
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


export class OrdersSeguimientoFindModel {
  startDate             : Date;
  endDate               : Date;
  businessPartnerGroup  : string;
  salesEmployee         : string;
  documentType          : string;
  status                : string;
  customer              : string;
  item                  : string;

  constructor(){
      this.startDate                =  null;
      this.endDate                  = null;
      this.businessPartnerGroup     = '';
      this.salesEmployee            = '';
      this.documentType             = '';
      this.status                   = '';
      this.customer                 = '';
      this.item                     = '';
  }
}
