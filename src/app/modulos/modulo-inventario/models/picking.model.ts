export class PickingCreateModel {
  u_BaseEntry         : number;
  u_BaseType          : number;
  u_FromWhsCod?       : string;
  u_CodeBar?          : string;
  u_UsrCreate         : number;

  constructor(){
      this.u_BaseType       = 0;
      this.u_BaseEntry      = 0;
      this.u_FromWhsCod     = '';
      this.u_CodeBar        = '';
      this.u_UsrCreate      = 0;
  }
}

export class InventoryTransferRequestPickingCreateModel {
  u_ItemCode          : string;
  u_Dscription        : string;
  u_CodeBar           : string;
  u_FromWhsCod        : string;
  u_WhsCode           : string;
  u_UnitMsr           : string;
  u_Quantity          : number;
  u_WeightKg          : number;
  u_Status            : string;
  u_UsrCreate         : number;

  constructor(){
      this.u_ItemCode       = '';
      this.u_Dscription     = '';
      this.u_CodeBar        = '';
      this.u_FromWhsCod     = '';
      this.u_WhsCode        = '';
      this.u_UnitMsr        = '';
      this.u_Quantity       = 0;
      this.u_WeightKg       = 0;
      this.u_Status         = '';
      this.u_UsrCreate      = 0;
  }
}


export class StockTransferPickingUpdateModel {
  docEntry            : number;
  u_BaseEntry         : number;
  u_BaseLine          : number;
  u_Status            : string;
  u_UsrUpdate         : number;

  constructor(){
    this.docEntry         = 0;
    this.u_BaseEntry      = 0;
    this.u_BaseEntry      = 0;
    this.u_Status         = '';
    this.u_UsrUpdate      = 0;
  }
}

export class DeliveryNotesPickingUpdateModel {
  docEntry            : number;
  u_BaseEntry         : number;
  u_BaseLine          : number;
  u_Status            : string;
  u_UsrUpdate         : number;

  constructor(){
    this.docEntry         = 0;
    this.u_BaseEntry      = 0;
    this.u_BaseEntry      = 0;
    this.u_Status         = '';
    this.u_UsrUpdate      = 0;
  }
}


export class PickingReleaseModel {
  u_BaseType          : number;
  u_CodeBar?          : string;
  u_IsReleased        : string;
  u_UsrRelease        : number;

  constructor(){
      this.u_BaseType       = 0;
      this.u_CodeBar        = '';
      this.u_IsReleased     = 'Y';
      this.u_UsrRelease     = 0;
  }
}

export class PickingDeleteModel {
  baseType            : number;
  baseEntry           : number;

  constructor(){
      this.baseType          = 0;
      this.baseEntry         = 0;
  }
}

export class PickingFindModel {
  u_Status            : string;
  u_BaseEntry         : number;
  u_BaseType          : number;
  u_BaseLine          : number;
  u_IsReturned        : string;
  u_CodeBar           : string;

  constructor(){
    this.u_Status         = '';
    this.u_BaseEntry      = 0;
    this.u_BaseType       = 0;
    this.u_BaseLine       = 0;
    this.u_IsReturned     = '';
    this.u_CodeBar        = '';
  }
}

export class PickingFilterModel {
  startDate           : Date;
  endDate             : Date;
  objType             : string;
  status              : string;
  searchText          : string;

  constructor(){
      this.startDate       = null;
      this.endDate         = null;
      this.objType         = '';
      this.status          = '';
      this.searchText      = '';
  }
}

export class PickingCopyToFindModel {
  u_BaseEntry         : number;
  u_BaseType          : number;
  lines?              : PickingToTransfer1Model[];

  constructor(){
    this.u_BaseEntry    = 0;
    this.u_BaseType     = 0;
    this.lines          = [];
  }
}

export class PickingToTransfer1Model {
  u_BaseEntry         : number;
  u_BaseType          : number;
  u_BaseLine          : number;
  u_FIB_IsPkg         : string;

  constructor(){
    this.u_BaseEntry      = 0;
    this.u_BaseType       = 0;
    this.u_BaseLine       = 0;
    this.u_FIB_IsPkg      = '';
  }
}


export class PickingPrintModel {
  u_TrgetEntry         : number;
  u_TargetType         : number;

  constructor(){
    this.u_TrgetEntry    = 0;
    this.u_TargetType    = 0;
  }
}
