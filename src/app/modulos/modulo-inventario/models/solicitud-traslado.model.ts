export class SolicitudTrasladoCreateModel {
  objType                     : string;
  docDate                     : Date;
  docDueDate                  : Date;
  taxDate                     : Date;
  u_FIB_IsPkg?                  : string;
  cardCode?                   : string;
  cardName?                   : string;
  cntctCode                   : number;
  address                     : string;
  filler                      : string;
  toWhsCode                   : string;
  u_FIB_TIP_TRAS              : string;
  u_BPP_MDMT                  : string;
  u_BPP_MDTS                  : string;
  slpCode                     : number;
  jrnlMemo                    : string;
  comments                    : string;
  u_UsrCreate                 : number;
  lines                       : SolicitudTraslado1CreateModel[];

  constructor(){
    this.objType              = '1250000001';
    this.docDate              = null;
    this.docDueDate           = null;
    this.taxDate              = null;
    this.u_FIB_IsPkg            = '';
    this.cardCode             = '';
    this.cardName             = '';
    this.cntctCode            = 0;
    this.address              = '';
    this.filler               = '';
    this.toWhsCode            = '';
    this.u_FIB_TIP_TRAS       = '';
    this.u_BPP_MDMT           = '';
    this.u_BPP_MDTS           = '';
    this.slpCode              = -1;
    this.jrnlMemo             = '';
    this.comments             = '';
    this.u_UsrCreate          = 0;
    this.lines                = [];
  }
}

export class SolicitudTraslado1CreateModel {
  itemCode                    : string;
  dscription                  : string;
  fromWhsCod                  : string;
  whsCode                     : string;
  u_tipoOpT12                 : string;
  unitMsr                     : string;
  quantity                    : number;
  openQty                     : number;
  u_FIB_OpQtyPkg              : number;

  constructor(){
    this.itemCode             = '';
    this.dscription           = '';
    this.fromWhsCod           = '';
    this.whsCode              = '';
    this.u_tipoOpT12          = '';
    this.unitMsr              = '';
    this.quantity             = 0;
    this.openQty              = 0;
    this.u_FIB_OpQtyPkg       = 0;
  }
}


export class SolicitudTrasladoUpdateModel {
  docEntry                    : number;
  objType                     : string;
  docDate                     : Date;
  docDueDate                  : Date;
  taxDate                     : Date;
  u_FIB_IsPkg?                  : string;
  filler                      : string;
  toWhsCode                   : string;
  u_FIB_TIP_TRAS              : string;
  u_BPP_MDMT                  : string;
  u_BPP_MDTS                  : string;
  slpCode                     : number;
  jrnlMemo                    : string;
  comments                    : string;
  u_UsrUpdate                 : number;
  lines                       : SolicitudTraslado1UpdateModel[];

  constructor(){
    this.docEntry             = 0;
    this.objType              = '1250000001';
    this.docDate              = null;
    this.docDueDate           = null;
    this.taxDate              = null;
    this.u_FIB_IsPkg            = '';
    this.filler               = '';
    this.toWhsCode            = '';
    this.u_FIB_TIP_TRAS       = '';
    this.u_BPP_MDMT           = '';
    this.u_BPP_MDTS           = '';
    this.slpCode              = -1;
    this.jrnlMemo             = '';
    this.comments             = '';
    this.u_UsrUpdate          = 0;
    this.lines                = [];
  }
}

export class SolicitudTraslado1UpdateModel {
  docEntry                    : number;
  lineNum                     : number;
  itemCode                    : string;
  lineStatus                  : string;
  dscription                  : string;
  fromWhsCod                  : string;
  whsCode                     : string;
  u_tipoOpT12                 : string;
  unitMsr                     : string;
  quantity                    : number;
  openQty                     : number;
  u_FIB_OpQtyPkg              : number;
  record                      : number;

  constructor(){
    this.docEntry             = 0;
    this.lineNum              = 0;
    this.lineStatus           = '';
    this.itemCode             = '';
    this.dscription           = '';
    this.fromWhsCod           = '';
    this.whsCode              = '';
    this.u_tipoOpT12          = '';
    this.unitMsr              = '';
    this.quantity             = 0;
    this.openQty              = 0;
    this.u_FIB_OpQtyPkg       = 0;
    this.record               = 0;
  }
}

export class SolicitudTrasladoFilterModel {
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

export class SolicitudTrasladoCloseModel {
  docEntry                    : number;
  u_UsrUpdate                 : number;

  constructor(){
    this.docEntry             = 0;
    this.u_UsrUpdate          = 0;
  }
}
