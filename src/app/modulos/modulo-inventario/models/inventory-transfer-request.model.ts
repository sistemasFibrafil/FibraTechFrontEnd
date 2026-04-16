import { InventoryTransferRequestPickingCreateModel } from "./picking.model";

export class InventoryTransferRequestCreateModel {
  objType                     : string;
  docDate                     : Date;
  docDueDate                  : Date;
  taxDate                     : Date;

  u_FIB_IsPkg?                : string;
  u_FIB_DocStPkg?             : string;

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
  lines                       : InventoryTransferRequest1CreateModel[];
  pickingLines                : InventoryTransferRequestPickingCreateModel[];

  constructor(){
    this.objType              = '1250000001';
    this.docDate              = null;
    this.docDueDate           = null;
    this.taxDate              = null;
    this.u_FIB_IsPkg          = '';
    this.u_FIB_DocStPkg       = '';
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
    this.pickingLines         = [];
  }
}

export class InventoryTransferRequest1CreateModel {
  itemCode        : string;
  dscription      : string;
  fromWhsCod      : string;
  whsCode         : string;
  unitMsr         : string;
  quantity        : number;
  u_FIB_OpQtyPkg  : number;
  u_FIB_LinStPkg  : string;
  u_tipoOpT12     : string;

  constructor(){
    this.itemCode        = '';
    this.dscription      = '';
    this.fromWhsCod      = '';
    this.whsCode         = '';

    this.unitMsr         = '';
    this.quantity        = 0;

    this.u_FIB_OpQtyPkg  = 0;
    this.u_FIB_LinStPkg  = '';
    this.u_tipoOpT12     = '';
  }
}

export class InventoryTransferRequestUpdateModel {
  docEntry                    : number;
  objType                     : string;
  docDate                     : Date;
  docDueDate                  : Date;
  taxDate                     : Date;

  u_FIB_IsPkg?                : string;

  cardCode?                   : string;
  filler                      : string;
  toWhsCode                   : string;

  u_FIB_TIP_TRAS              : string;
  u_BPP_MDMT                  : string;
  u_BPP_MDTS                  : string;

  slpCode                     : number;

  jrnlMemo                    : string;
  comments                    : string;
  u_UsrUpdate                 : number;
  lines                       : InventoryTransferRequest1UpdateModel[];

  constructor(){
    this.docEntry             = 0;
    this.objType              = '1250000001';
    this.docDate              = null;
    this.docDueDate           = null;
    this.taxDate              = null;
    this.u_FIB_IsPkg            = '';
    this.cardCode             = '';
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

export class InventoryTransferRequest1UpdateModel {
  docEntry                    : number;
  lineNum                     : number;
  lineStatus                  : string;

  itemCode                    : string;
  dscription                  : string;
  fromWhsCod                  : string;
  whsCode                     : string;

  unitMsr                     : string;
  quantity                    : number;

  u_FIB_OpQtyPkg              : number;
  u_tipoOpT12                 : string;

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
    this.u_FIB_OpQtyPkg       = 0;
    this.record               = 0;
  }
}

export class InventoryTransferRequestFilterModel {
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

export class InventoryTransferRequestCloseModel {
  docEntry                    : number;
  u_UsrUpdate                 : number;

  constructor(){
    this.docEntry             = 0;
    this.u_UsrUpdate          = 0;
  }
}
