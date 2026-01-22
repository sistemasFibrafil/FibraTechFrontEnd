export class SolicitudCompraCreateModel {
  objType                     : string;
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
  lines                       : SolicitudCompra1CreateModel[];

  constructor(){
    this.objType              = '1470000113';
    this.docDate              = null;
    this.docDueDate           = null;
    this.taxDate              = null;
    this.reqDate              = null;
    this.reqType              = 0;
    this.requester            = '';
    this.reqName              = '';
    this.branch               = 0;
    this.department           = 0;
    this.notify               = '';
    this.email                = '';
    this.docType              = 'I';
    this.ownerCode            = 0;
    this.comments             = '';
    this.u_UsrCreate          = 0;
    this.lines                = [];
  }
}

export class SolicitudCompra1CreateModel {
  itemCode                    : string;
  dscription                  : string;
  lineVendor                  : string;
  pqtReqDate                  : Date;
  acctCode                    : string;
  ocrCode                     : string;
  u_tipoOpT12                 : string;
  u_FF_TIP_COM                : string;
  whsCode                     : string;
  unitMsr                     : string;
  quantity                    : number;

  constructor(){
    this.itemCode             = '';
    this.dscription           = '';
    this.lineVendor           = '';
    this.pqtReqDate           = null;
    this.whsCode              = '';
    this.u_tipoOpT12          = '';
    this.u_FF_TIP_COM         = '';
    this.unitMsr              = '';
    this.quantity             = 0;
  }
}


export class SolicitudCompraUpdateModel {
  docEntry                    : number;
  objType                     : string;
  docDate                     : Date;
  docDueDate                  : Date;
  taxDate                     : Date;
  reqDate                     : Date;
  reqType                     : number;
  requester                   : string;
  reqName                     : string;
  branch                      : number;
  department                  : number;
  notify                      : string;
  email                       : string;
  docType                     : string;
  ownerCode                   : number;
  comments                    : string;
  u_UsrUpdate                 : number;
  lines                       : SolicitudCompra1UpdateModel[];

  constructor(){
    this.objType              = '1470000113';
    this.docDate              = null;
    this.docDueDate           = null;
    this.taxDate              = null;
    this.reqDate              = null;
    this.reqType              = 0;
    this.requester            = '';
    this.reqName              = '';
    this.branch               = 0;
    this.department           = 0;
    this.notify               = '';
    this.email                = '';
    this.docType              = 'I';
    this.ownerCode            = 0;
    this.comments             = '';
    this.u_UsrUpdate          = 0;
    this.lines                = [];
  }
}

export class SolicitudCompra1UpdateModel {
  docEntry                    : number;
  lineNum                     : number;
  lineStatus                  : string;
  itemCode                    : string;
  dscription                  : string;
  lineVendor                  : string;
  pqtReqDate                  : Date;
  acctCode                    : string;
  ocrCode                     : string;
  u_tipoOpT12                 : string;
  u_FF_TIP_COM                : string;
  whsCode                     : string;
  unitMsr                     : string;
  quantity                    : number;
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
    this.u_tipoOpT12          = '';
    this.u_FF_TIP_COM         = '';
    this.unitMsr              = '';
    this.quantity             = 0;
    this.record               = 0;
  }
}

export class SolicitudCompraCloseModel {
  id                         : number;
  docEntry                    : number;
  idUsuarioClose              : number;

  constructor(){
    this.id                   = 0;
    this.docEntry             = 0;
    this.idUsuarioClose       = 0;
  }
}

export class SolicitudCompraFilterModel {
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
