import { StockTransferPickingUpdateModel } from "./picking.model";

export class StockTransfersCreateModel {
  objType                 : string;
  u_BPP_MDTD              : string;
  u_BPP_MDSD              : string;
  u_BPP_MDCD              : string;

  docDate?                : Date;
  taxDate?                : Date;

  cardCode?               : string;
  cardName?               : string;
  cntctCode?              : number;
  address                 : string;

  filler                  : string;
  toWhsCode               : string;

  u_FIB_TIP_TRANS         : string;
  u_FIB_COD_TRA           : string;
  u_FIB_TIPDOC_TRA        : string;
  u_BPP_MDRT              : string;
  u_BPP_MDNT              : string;
  u_BPP_MDVC              : string;

  u_FIB_TIPDOC_COND       : string;
  u_FIB_NUMDOC_COD        : string;
  u_FIB_NOM_COND          : string;
  u_FIB_APE_COND          : string;
  u_BPP_MDFN              : string;
  u_BPP_MDFC              : string;

  u_FIB_TIP_TRAS          : string;
  u_BPP_MDMT              : string;
  u_BPP_MDTS              : string;

  slpCode                 : number;

  u_FIB_NBULTOS           : number;
  u_FIB_KG                : number;

  jrnlMemo                : string;
  comments                : string;

  u_UsrCreate             : number;

  lines                   : StockTransfers1CreateModel[];
  pickingLines            : StockTransferPickingUpdateModel[];

  constructor(){
    this.objType                  = '67';
    this.u_BPP_MDTD               = '';
    this.u_BPP_MDSD               = '';
    this.u_BPP_MDCD               = '';

    this.docDate                  = null;
    this.taxDate                  = null;

    this.cardCode                 = '';
    this.cardName                 = '';
    this.cntctCode                = 0;
    this.address                  = '';

    this.filler                   = '';
    this.toWhsCode                = '';

    this.u_FIB_TIP_TRANS          = '';
    this.u_FIB_COD_TRA            = '';
    this.u_FIB_TIPDOC_TRA         = '';
    this.u_BPP_MDRT               = '';
    this.u_BPP_MDNT               = '';
    this.u_BPP_MDVC               = '';

    this.u_FIB_TIPDOC_COND        = '';
    this.u_FIB_NUMDOC_COD         = '';
    this.u_FIB_NOM_COND           = '';
    this.u_FIB_APE_COND           = '';
    this.u_BPP_MDFN               = '';
    this.u_BPP_MDFC               = '';

    this.u_FIB_TIP_TRAS           = '';
    this.u_BPP_MDMT               = '';
    this.u_BPP_MDTS               = '';

    this.slpCode                  = -1;

    this.u_FIB_NBULTOS            = 0;
    this.u_FIB_KG                 = 0;

    this.jrnlMemo                 = '';
    this.comments                 = '';

    this.u_UsrCreate              = 0;

    this.lines                    = [];
    this.pickingLines             = [];
  }
}
export class StockTransfers1CreateModel {
  baseType?                   : number;
  baseEntry?                  : number;
  baseLine?                   : number;

  itemCode                    : string;
  dscription                  : string;
  fromWhsCod                  : string;
  whsCode                     : string;

  unitMsr                     : string;
  quantity                    : number;

  u_FIB_FromPkg               : string;
  u_tipoOpT12                 : string;
  u_FIB_NBulto                : number;
  u_FIB_PesoKg                : number;

  constructor(){
    this.baseType             = -1;
    this.baseEntry            = null;
    this.baseLine             = null;

    this.itemCode             = '';
    this.dscription           = '';
    this.fromWhsCod           = '';
    this.whsCode              = '';

    this.unitMsr              = '';
    this.quantity             = 0;

    this.u_FIB_FromPkg        = '';
    this.u_tipoOpT12          = '';
    this.u_FIB_NBulto         = 0;
    this.u_FIB_PesoKg         = 0;
  }
}


export class StockTransfersUpdateModel {
  docEntry                : number;
  objType                 : string;

  u_BPP_MDTD              : string;
  u_BPP_MDSD              : string;
  u_BPP_MDCD              : string;

  taxDate                 : Date;

  cardCode                : string;

  u_FIB_TIP_TRANS         : string;
  u_FIB_COD_TRA           : string;
  u_FIB_TIPDOC_TRA        : string;
  u_BPP_MDRT              : string;
  u_BPP_MDNT              : string;
  u_BPP_MDVC              : string;

  u_FIB_TIPDOC_COND       : string;
  u_FIB_NUMDOC_COD        : string;
  u_FIB_NOM_COND          : string;
  u_FIB_APE_COND          : string;
  u_BPP_MDFN              : string;
  u_BPP_MDFC              : string;

  u_FIB_TIP_TRAS          : string;
  u_BPP_MDMT              : string;
  u_BPP_MDTS              : string;

  slpCode                 : number;

  u_FIB_NBULTOS           : number;
  u_FIB_KG                : number;

  jrnlMemo                : string;
  comments                : string;

  u_UsrUpdate             : number;

  lines                   : StockTransfers1UpdateModel[];

  constructor(){
    this.docEntry                 = 0;
    this.objType                  = '67';

    this.u_BPP_MDTD               = '';
    this.u_BPP_MDSD               = '';
    this.u_BPP_MDCD               = '';

    this.taxDate                  = null;

    this.cardCode                 = '';

    this.u_FIB_TIP_TRANS          = '';
    this.u_FIB_COD_TRA            = '';
    this.u_FIB_TIPDOC_TRA         = '';
    this.u_BPP_MDRT               = '';
    this.u_BPP_MDNT               = '';
    this.u_BPP_MDVC               = '';

    this.u_FIB_TIPDOC_COND        = '';
    this.u_FIB_NUMDOC_COD         = '';
    this.u_FIB_NOM_COND           = '';
    this.u_FIB_APE_COND           = '';
    this.u_BPP_MDFN               = '';
    this.u_BPP_MDFC               = '';

    this.u_FIB_TIP_TRAS           = '';
    this.u_BPP_MDMT               = '';
    this.u_BPP_MDTS               = '';

    this.slpCode                  = -1;

    this.u_FIB_NBULTOS            = 0;
    this.u_FIB_KG                 = 0;

    this.jrnlMemo                 = '';
    this.comments                 = '';

    this.u_UsrUpdate              = 0;

    this.lines                    = [];
  }
}
export class StockTransfers1UpdateModel {
  docEntry                    : number;
  lineNum                     : number;
  itemCode                    : string;
  dscription                  : string;
  fromWhsCod                  : string;
  whsCode                     : string;

  constructor(){
    this.docEntry             = 0;
    this.lineNum              = 0;
    this.itemCode             = '';
    this.dscription           = '';
    this.fromWhsCod           = '';
    this.whsCode              = '';
  }
}

export class StockTransfersFilterModel {
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
