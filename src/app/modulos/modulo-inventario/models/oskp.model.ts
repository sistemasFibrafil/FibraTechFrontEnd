export class OSKPCreateModel {
  u_Number        : string;
  u_PrdStrDate    : Date;
  u_PrdEndDate    : Date;
  u_PrdEndHour    : Date;
  u_RollWeight    : number;
  u_PrdForDetail  : string;
  u_PrdPresBale   : string;
  u_PrdFeaYes     : string;
  u_PrdFeaNo      : string;
  u_PrdFeaObs     : string;
  u_FeaQuaInd     : string;
  u_FeaQuaJus     : string;
  u_CosStrDate    : Date;
  u_CosEndDate    : Date;
  u_CosEndHour    : Date;
  u_CosDetail     : string;
  u_ValExcMar     : string;
  u_AprByExc      : string;
  u_Observations  : string;
  u_ItemCode      : string;
  line            : ISKP1CreateModel[];

  constructor(){
      this.u_Number         = '';
      this.u_PrdStrDate     = null;
      this.u_PrdEndDate     = null;
      this.u_PrdEndHour     = null;
      this.u_RollWeight     = 0;
      this.u_PrdPresBale    = '';
      this.u_PrdFeaYes      = '';
      this.u_PrdFeaNo       = '';
      this.u_PrdFeaObs      = '';
      this.u_FeaQuaInd      = '';
      this.u_FeaQuaJus      = '';
      this.u_CosStrDate     = null;
      this.u_CosEndDate     = null;
      this.u_CosEndHour     = null;
      this.u_CosDetail      = '';
      this.u_ValExcMar      = '';
      this.u_AprByExc       = '';
      this.u_Observations   = '';
      this.u_ItemCode       = '';
      this.line             = [];
  }
}

export class ISKP1CreateModel {
  u_ProcessCode     : string;
  u_ProcessName?    : string;
  u_Percentage1     : number;
  u_ItemCode        : string;
  u_ItemName?       : string;
  u_Percentage2     : number;

  constructor(){
      this.u_ProcessCode    = null;
      this.u_ProcessName    = null;
      this.u_Percentage1    = 0;
      this.u_ItemCode       = null;
      this.u_ItemName       = null;
      this.u_Percentage2    = 0;
  }
}


export class OSKPUpdateModel {
  docEntry        : number;
  u_Number        : string;
  u_PrdStrDate    : Date;
  u_PrdEndDate    : Date;
  u_PrdEndHour    : Date;
  u_RollWeight    : number;
  u_PrdForDetail  : string;
  u_PrdPresBale   : string;
  u_PrdFeaYes     : string;
  u_PrdFeaNo      : string;
  u_PrdFeaObs     : string;
  u_FeaQuaInd     : string;
  u_FeaQuaJus     : string;
  u_CosStrDate    : Date;
  u_CosEndDate    : Date;
  u_CosEndHour    : Date;
  u_CosDetail     : string;
  u_ValExcMar     : string;
  u_AprByExc      : string;
  u_Observations  : string;
  u_ItemCode      : string;
  line            : ISKP1UpdateModel[];


  constructor(){
      this.docEntry         = 0;
      this.u_Number         = '';
      this.u_PrdStrDate     = null;
      this.u_PrdEndDate     = null;
      this.u_PrdEndHour     = null;
      this.u_RollWeight     = 0;
      this.u_PrdPresBale    = '';
      this.u_PrdFeaYes      = '';
      this.u_PrdFeaNo       = '';
      this.u_PrdFeaObs      = '';
      this.u_FeaQuaInd      = '';
      this.u_FeaQuaJus      = '';
      this.u_CosStrDate     = null;
      this.u_CosEndDate     = null;
      this.u_CosEndHour     = null;
      this.u_CosDetail      = '';
      this.u_ValExcMar      = '';
      this.u_AprByExc       = '';
      this.u_Observations   = '';
      this.u_ItemCode       = '';
      this.line             = [];
  }
}

export class ISKP1UpdateModel {
  lineId            : number
  u_ProcessCode     : string;
  u_ProcessName?    : string;
  u_Percentage1     : number;
  u_ItemCode        : string;
  u_ItemName?       : string;
  u_Percentage2     : number;

  constructor(){
      this.lineId           = 0;
      this.u_ProcessCode    = null;
      this.u_ProcessName    = null;
      this.u_Percentage1    = 0;
      this.u_ItemCode       = null;
      this.u_ItemName       = null;
      this.u_Percentage2    = 0;
  }
}

export class OSKPDeleteModel {
  docEntry          : number

  constructor(){
      this.docEntry           = 0;
  }
}


export class OSKPFindByFiltroModel {
  filtro          : string

  constructor(){
      this.filtro           = '';
  }
}
