export class OSKCCreateModel {
  u_Number          : string;
  u_SlpCode         : number;
  u_Status          : string;
  u_DocDate         : Date;
  u_ItemCodeBase    : string;
  u_ItmsGrpCod      : number;
  u_ItmsSGrpCod     : string;
  u_ItemName        : string;
  u_CardCode        : string;
  u_Quantity        : number;
  u_UnitMsrCode     : string;
  u_Wide            : number;
  u_UnitCode        : number;
  u_Long            : number;
  u_GrMtSq          : number;
  u_ItemWeight      : number;
  u_ColorCode       : string;
  u_Laminate        : string;
  u_LamTypCode      : string;
  u_Linner          : string;
  u_LinnWeight      : number;
  u_Print           : string;
  u_PrintColCode    : string;
  u_Fuelle          : string;
  u_UvByMonCode     : string;
  u_PrjMonVol       : number;
  u_Price           : number;
  u_Observations    : string;


  constructor(){
      this.u_Number         = '';
      this.u_SlpCode        = 0;
      this.u_Status         = '';
      this.u_DocDate        = null;
      this.u_ItemCodeBase   = '';
      this.u_ItmsGrpCod     = 0;
      this.u_ItmsSGrpCod    = '';
      this.u_ItemName       = '';
      this.u_CardCode       = '';
      this.u_Quantity       = 0;
      this.u_UnitMsrCode    = '';
      this.u_Long           = 0;
      this.u_UnitCode       = 0;
      this.u_GrMtSq         = 0;
      this.u_ItemWeight     = 0;
      this.u_ColorCode      = '';
      this.u_Laminate       = '';
      this.u_LamTypCode     = '';
      this.u_Linner         = '';
      this.u_LinnWeight     = 0;
      this.u_Print          = '';
      this.u_PrintColCode   = '';
      this.u_Fuelle         = '';
      this.u_UvByMonCode    = '';
      this.u_PrjMonVol      = 0;
      this.u_Price          = 0;
      this.u_Observations   = '';
  }
}

export class OSKCUpdateModel {
  code              : string;
  u_Number          : string;
  u_SlpCode         : number;
  u_Status          : string;
  u_DocDate         : Date;
  u_ItemCodeBase    : string;
  u_ItmsGrpCod      : number;
  u_ItmsSGrpCod     : string;
  u_ItemName        : string;
  u_CardCode        : string;
  u_UnitMsrCode     : string;
  u_Quantity        : number;
  u_Wide            : number;
  u_UnitCode        : number;
  u_Long            : number;
  u_GrMtSq          : number;
  u_ItemWeight      : number;
  u_ColorCode       : string;
  u_Laminate        : string;
  u_LamTypCode      : string;
  u_Linner          : string;
  u_LinnWeight      : number;
  u_Print           : string;
  u_PrintColCode    : string;
  u_Fuelle          : string;
  u_UvByMonCode     : string;
  u_PrjMonVol       : number;
  u_Price           : number;
  u_Observations    : string;


  constructor(){
      this.code             = '';
      this.u_Number         = '';
      this.u_SlpCode        = 0;
      this.u_Status         = '';
      this.u_DocDate        = null;
      this.u_ItemCodeBase   = '';
      this.u_ItmsGrpCod     = 0;
      this.u_ItmsSGrpCod    = '';
      this.u_ItemName       = '';
      this.u_CardCode       = '';
      this.u_UnitMsrCode    = '';
      this.u_Quantity       = 0;
      this.u_Wide           = 0;
      this.u_Long           = 0;
      this.u_GrMtSq         = 0;
      this.u_ItemWeight     = 0;
      this.u_ColorCode      = '';
      this.u_Laminate       = '';
      this.u_LamTypCode     = '';
      this.u_Linner         = '';
      this.u_LinnWeight     = 0;
      this.u_Print          = '';
      this.u_PrintColCode   = '';
      this.u_UvByMonCode    = '';
      this.u_PrjMonVol      = 0;
      this.u_Price          = 0;
      this.u_Observations   = '';
  }
}



export class OSKCFindByDateModel {
  strDate         : Date;
  endDate         : Date;


  constructor(){
      this.strDate  = null;
      this.endDate  = null;
  }
}

export class OSKCDeleteModel {
  code         : string;


  constructor(){
      this.code  = '';
  }
}

export class OSKCFindByFiltroModel {
  filtro         : string;


  constructor(){
      this.filtro  = '';
  }
}
