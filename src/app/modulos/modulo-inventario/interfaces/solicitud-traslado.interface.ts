import { IPicking } from "./picking.inteface";

export interface ISolicitudTraslado {
  docEntry            : number;
  docNum              : number;
  docStatus           : string;
  docDate             : Date;
  docDueDate          : Date;
  taxDate             : Date;
  u_FIB_IsPkg?        : string;
  cardCode?           : string;
  cardName?           : string;
  cntctCode?          : number;
  address             : string;
  filler              : string;
  toWhsCode           : string;
  u_FIB_TIP_TRAS      : string;
  u_BPP_MDMT          : string;
  u_BPP_MDTS          : string;
  slpCode             : number;
  u_FIB_NBULTOS       : number;
  u_FIB_KG            : number;
  jrnlMemo            : string;
  comments            : string;
  lines               : ISolicitudTraslado1[];
  pickingLines        : IPicking[];
}

export interface ISolicitudTraslado1 {
  objType?            : string;
  docEntry?           : number;
  lineNum?            : number;
  baseType?           : number;
  baseEntry?          : number;
  baseLine?           : number;
  lineStatus          : string;
  u_FIB_LinStPkg?     : string;
  u_FIB_FromPkg?      : string;
  itemCode            : string;
  dscription          : string;
  fromWhsCod          : string;
  whsCode             : string;
  u_tipoOpT12?        : string;
  u_tipoOpT12Nam?     : string;
  unitMsr             : string;
  quantity            : number;
  u_FIB_OpQtyPkg      : number;
  openQty             : number;
  u_FIB_NBulto?       : number;
  u_FIB_PesoKg?       : number;
  record?             : number;
}
