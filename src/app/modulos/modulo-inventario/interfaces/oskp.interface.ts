export interface IOSKP {
  docEntry        : number;
  u_Number        : string;
  u_ItemName      : string;
  u_CardCode      : string;
  u_CardName      : string;
  u_PrdStrDate    : Date;
  u_PrdEndDate    : Date;
  u_PrdEndHour    : string;
  u_RollWeight    : number;
  u_PrdForDetail   : string;
  u_PrdPresBale   : string;
  u_PrdFeaYes     : string;
  u_PrdFeaNo      : string;
  u_PrdFeaObs     : string;
  u_FeaQuaInd     : string;
  u_FeaQuaJus     : string;
  u_CosStrDate    : Date;
  u_CosEndDate    : Date;
  u_CosEndHour    : string;
  u_CosDetail     : string;
  u_ValExcMar     : string;
  u_AprByExc      : string;
  u_Observations  : string;
  u_ItemCode      : string;
  line            : ISKP1[];
}

export interface ISKP1 {
  lineId          : number
  u_ProcessCode   : string;
  u_ProcessName   : string;
  u_Percentage1   : number;
  u_ItemCode      : string;
  u_ItemName      : string;
  u_Percentage2   : number;
}
