import { IPicking } from "./picking.inteface";

export interface IInventoryTransferRequest {
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
  lines               : IInventoryTransferRequest1[];
  pickingLines        : IPicking[];
}

export interface IInventoryTransferRequest1 {
  objType?        : string;
  docEntry?       : number;
  lineNum?        : number;
  baseType?       : number;
  baseEntry?      : number;
  baseLine?       : number;
  lineStatus?     : string;

  // 🔒 CAMPOS OBLIGATORIOS (alineados con CreateModel)
  itemCode        : string;
  dscription      : string;
  fromWhsCod      : string;
  whsCode         : string;
  u_tipoOpT12     : string;     // ⬅️ quitar ?
  unitMsr         : string;
  quantity        : number;
  openQty         : number;
  u_FIB_LinStPkg? : string;
  u_FIB_FromPkg?  : string;
  u_FIB_OpQtyPkg  : number;     // ⬅️ obligatorio

  // Extras (lectura / SAP)
  u_tipoOpT12Nam? : string;
  u_FIB_NBulto?   : number;
  u_FIB_PesoKg?   : number;
  record?         : number;
}
