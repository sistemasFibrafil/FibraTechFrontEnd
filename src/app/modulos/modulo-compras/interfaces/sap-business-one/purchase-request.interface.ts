export interface IPurchaseRequest {
  docEntry            : number;
  docNum              : number;
  objType             : string;
  docStatus           : string;
  docDate             : Date;
  docDueDate          : Date;
  taxDate             : Date;
  reqDate             : Date;
  reqType             : number;
  requester           : string;
  reqName             : string;
  branch              : number;
  department          : number;
  notify              : string;
  email               : string;
  docType             : string;
  ownerCode           : number;
  comments            : string;
  lines               : IPurchaseRequest1[];
}

export interface IPurchaseRequest1 {
  docEntry?           : number;
  lineNum?            : number;
  objType?            : string;
  baseType?           : number;
  baseEntry?          : number;
  baseLine?           : number;
  lineStatus?         : string;
  itemCode            : string;
  dscription          : string;
  lineVendor?         : string;
  pqtReqDate          : Date;
  acctCode            : string;
  formatCode          : string;
  acctName?           : string;
  ocrCode?            : string;
  whsCode             : string;
  u_tipoOpT12?        : string;
  u_tipoOpT12Nam?     : string;
  u_FF_TIP_COM?       : string;
  u_FF_TIP_COM_NAM?   : string;
  unitMsr             : string;
  onHand              : number;
  quantity            : number;
  openQty             : number;
  record?             : number;
}
