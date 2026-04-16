export interface IApprovalRequests {
  wddCode         : number;
  wtmCode         : number;
  ownerID         : number;
}


export interface IApprovalStatusReportQuery {
  order                   : number;
  docEntry                : number;
  docNumOrder             : number;
  docNumPreliminary       : number;
  objType                 : string;
  docDate                 : Date;
  createDate              : Date;
  createTime              : number;
  createTimeString        : string;
  isDraft                 : string;
  cardCode                : string;
  cardName                : string;
  authorName              : string;
  documentStatus          : string;
  remarks                 : string;

  lines                   : IApprovalStatusReportLines1Query[];
}

export interface IApprovalStatusReportLines1Query {
  wddCode                 : number;
  docEntry                : number;
  docNumOrder             : number;
  docNumPreliminary       : number;
  objType                 : string;
  createDate              : Date;
  authorName              : string;
  modelName               : string;
  approverStatus          : string;
  isDraft                 : string;
  remarks                 : string;

  lines                   : IApprovalStatusReportLines2Query[];
}

export interface IApprovalStatusReportLines2Query {
  wddCode                 : number;
  stapaName               : string;
  authorizerName          : string;
  status                  : string;
  updateDate?             : Date;
  updateTime?             : number;
  updateTimeString        : string;
  remarks                 : string;
}
