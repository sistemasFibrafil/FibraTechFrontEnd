export class PurchaseRequestCreateModel {
  docDate                     : Date;
  docDueDate                  : Date;
  taxDate                     : Date;
  reqDate                     : Date;

  docType                     : string;

  reqType                     : number;
  requester                   : string;
  reqName                     : string;

  branch                      : number;
  department                  : number;

  notify                      : string;
  email                       : string;

  ownerCode                   : number;

  comments                    : string;

  u_UsrCreate                 : number;

  lines                       : PurchaseRequest1CreateModel[];

  constructor(){
    this.docDate              = null;
    this.docDueDate           = null;
    this.taxDate              = null;
    this.reqDate              = null;

    this.docType              = 'I';

    this.reqType              = 0;
    this.requester            = '';
    this.reqName              = '';

    this.branch               = 0;
    this.department           = 0;

    this.notify               = '';
    this.email                = '';

    this.ownerCode            = 0;

    this.comments             = '';

    this.u_UsrCreate          = 0;

    this.lines                = [];
  }
}

export class PurchaseRequest1CreateModel {
  itemCode                    : string;
  dscription                  : string;

  lineVendor                  : string;
  pqtReqDate                  : Date;

  acctCode                    : string;
  ocrCode                     : string;

  whsCode                     : string;

  unitMsr                     : string;
  quantity                    : number;

  u_tipoOpT12                 : string;
  u_FF_TIP_COM                : string;

  constructor(){
    this.itemCode             = '';
    this.dscription           = '';

    this.lineVendor           = '';
    this.pqtReqDate           = null;

    this.acctCode             = '';
    this.ocrCode              = '';

    this.whsCode              = '';

    this.unitMsr              = '';
    this.quantity             = 0;

    this.u_tipoOpT12          = '';
    this.u_FF_TIP_COM         = '';
  }
}


export class PurchaseRequestUpdateModel {
  docEntry                    : number;

  docDate                     : Date;
  docDueDate                  : Date;
  taxDate                     : Date;
  reqDate                     : Date;

  docType                     : string;

  reqType                     : number;
  requester                   : string;
  reqName                     : string;

  branch                      : number;
  department                  : number;

  notify                      : string;
  email                       : string;

  ownerCode                   : number;

  comments                    : string;

  u_UsrUpdate                 : number;

  lines                       : PurchaseRequest1UpdateModel[];

  constructor(){
    this.docEntry             = 0;

    this.docDate              = null;
    this.docDueDate           = null;
    this.taxDate              = null;
    this.reqDate              = null;

    this.docType              = 'I';

    this.reqType              = 0;
    this.requester            = '';
    this.reqName              = '';

    this.branch               = 0;
    this.department           = 0;

    this.notify               = '';
    this.email                = '';

    this.ownerCode            = 0;

    this.comments             = '';

    this.u_UsrUpdate          = 0;

    this.lines                = [];
  }
}

export class PurchaseRequest1UpdateModel {
  docEntry                    : number;
  lineNum                     : number;
  lineStatus                  : string;

  itemCode                    : string;
  dscription                  : string;

  lineVendor                  : string;
  pqtReqDate                  : Date;

  acctCode                    : string;
  ocrCode                     : string;

  whsCode                     : string;

  unitMsr                     : string;
  quantity                    : number;

  u_tipoOpT12                 : string;
  u_FF_TIP_COM                : string;

  record                      : number;

  constructor(){

    this.docEntry             = 0;
    this.lineNum              = 0;
    this.lineStatus           = '';

    this.itemCode             = '';
    this.dscription           = '';

    this.lineVendor           = '';
    this.pqtReqDate           = null;

    this.whsCode              = '';

    this.unitMsr              = '';
    this.quantity             = 0;

    this.u_tipoOpT12          = '';
    this.u_FF_TIP_COM         = '';

    this.record               = 0;
  }
}

export class PurchaseRequestCloseModel {
  id                         : number;
  docEntry                    : number;
  idUsuarioClose              : number;

  constructor(){
    this.id                   = 0;
    this.docEntry             = 0;
    this.idUsuarioClose       = 0;
  }
}

export class PurchaseRequestFilterModel {
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
