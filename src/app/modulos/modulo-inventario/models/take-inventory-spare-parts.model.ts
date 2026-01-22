export class TakeInventorySparePartsModel {
  docEntry      : number;
  u_ItemCode    : string;
  u_Dscription  : string;
  u_WhsCode     : string;
  u_UnitMsr     : string;
  u_OnHandPhy   : number;
  u_OnHandSys   : number;
  u_Difference  : number;
  u_UsrUpdate   : number
  u_UpdateDate? : Date | any;
  u_UpdateTime  : Date | any;

  constructor(){
    this.docEntry         = 0;
    this.u_ItemCode       = '';
    this.u_Dscription     = '';
    this.u_WhsCode        = '';
    this.u_UnitMsr        = '';
    this.u_OnHandPhy      = 0;
    this.u_OnHandSys      = 0;
    this.u_Difference     = 0;
    this.u_UsrUpdate      = 0;
    this.u_UpdateDate     = new Date();
    this.u_UpdateTime     = new Date();
  }
}

export class TakeInventorySparePartsCreateModel {
  u_WhsCode     : string;
  u_CodeBar     : string;
  u_UsrCreate   : number;
  u_CreateDate? : Date | any;
  u_CreateTime  : Date | any;

  constructor(){
    this.u_WhsCode        = '';
    this.u_CodeBar        = '';
    this.u_UsrCreate      = 0;
    this.u_CreateDate     = new Date();
    this.u_CreateTime     = new Date();
  }
}

export class TakeInventorySparePartsUpdateModel {
  docEntry      : number;
  u_WhsCode     : string;
  u_OnHandPhy   : number;
  u_Difference  : number;
  u_UsrUpdate   : number
  u_UpdateDate? : Date | any;
  u_UpdateTime  : Date | any;

  constructor(){
    this.docEntry         = 0;
    this.u_WhsCode        = '';
    this.u_OnHandPhy      = 0;
    this.u_Difference     = 0;
    this.u_UsrUpdate      = 0;
    this.u_UpdateDate     = new Date();
    this.u_UpdateTime     = new Date();
  }
}

export class TakeInventorySparePartsDeleteModel {
  docEntry      : number;
  u_WhsCode     : string;
  u_IsDelete    : string;
  u_UsrDelete   : number
  u_DeleteDate? : Date | any;
  u_DeleteTime  : Date | any;

  constructor(){
    this.docEntry         = 0;
    this.u_IsDelete       = 'Y';
    this.u_WhsCode        = '';
    this.u_UsrDelete      = 0;
    this.u_DeleteDate     = new Date();
    this.u_DeleteTime     = new Date();
  }
}

export class TakeInventorySparePartsFilterModel {
  startDate : Date;
  endDate   : Date;
  usuario   : string
  whsCode   : string;
  item      : string;

  constructor(){
    this.startDate      = null;
    this.endDate        = null;
    this.usuario        = '';
    this.whsCode        = '';
    this.item           = '';
  }
}

export class TakeInventorySparePartsFindModel {
  u_WhsCode     : string;
  u_UsrCreate   : number;
  u_CreateDate  : Date;

  constructor(){
    this.u_WhsCode      = '';
    this.u_UsrCreate    = 0;
    this.u_CreateDate   = null;
  }
}

