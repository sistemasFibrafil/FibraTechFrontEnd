export interface IPicking {
  docEntry              : number;
  u_Status              : string;
  u_IsReleased          : string;
  u_BaseEntry           : number;
  u_BaseNum             : number;
  u_BaseType            : number;
  u_BaseLine            : number;
  u_DocDate             : Date;
  u_TaxDate             : Date;
  u_DocDueDate          : Date;
  u_CardCode?           : string;
  u_CardName?           : string;
  u_ItemCode?           : string;
  u_Dscription?         : string;
  u_CodeBar?            : string;
  u_FromWhsCod          : string;
  u_WhsCode?            : string;
  U_tipoOpT12           : string;
  U_tipoOpT12Nam        : string;
  u_UnitMsr             : string;
  u_Quantity            : number;
  u_WeightKg            : number;
  u_NumBulk             : number;
  u_FIB_IsPkg           : string;
  u_OpenQty             : number;
  u_QtyPkg              : number;
  u_EngQtyPkg           : number;
  u_DisQtyPkg           : number;
  idUsuarioCreate       : number;
  lines1?               : IPicking1[];
  lines2?               : IPicking1[];
}

export interface IPicking1 {
  u_DocEntry            : number;
  u_BaseNum             : number;
  u_BaseType            : number;
  u_IsReturned          : string;
  u_ItemCode?           : string;
  u_Dscription?         : string;
  u_FromWhsCod          : string;
  u_WhsCode?            : string;
  u_UnitMsr             : string;
  u_Quantity            : number;
  u_WeightKg            : number;
  u_NumBulk             : number;
}


export interface IPicking {
  docEntry              : number;
  u_BaseEntry           : number;
  u_BaseNum             : number;
  u_BaseType            : number;
  u_BaseLine            : number;
  u_ItemCode?           : string;
  u_Dscription?         : string;
  u_CodeBar?            : string;
  u_FromWhsCod          : string;
  u_WhsCode?            : string;
  u_UnitMsr             : string;
  u_Quantity            : number;
  u_WeightKg            : number;
  u_NumBulk             : number;
}

export interface IPickingByObject {
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
  comments            : string;
  linea               : IPickingLineaByObject[];
}

export interface IPickingLineaByObject {
  idLectura           : number;
  idBase              : number;
  lineBase            : number;
  objType             : string;
  docEntry            : number;
  docNum              : number;
  lineNum             : number;
  itemCode?           : string;
  dscription?         : string;
  fromWhsCod          : string;
  whsCode?            : string;
  unitMsr             : string;
  quantity            : number;
  peso                : number;
}

export interface IPickingCopyToTransferencia {
  cardCode?             : string;
  cardName?             : string;
  cntctCode             : number;
  address               : string;
  filler                : string;
  toWhsCode?            : string;
  u_FIB_TIP_TRAS        : string;
  u_BPP_MDMT            : string;
  u_BPP_MDTS            : string;
  slpCode               : number;
  jrnlMemo              : string;
  comments?             : string;
  linea1                : IPickingCopyToTransferenciaDetalle1[];
  linea2                : IPickingCopyToTransferenciaDetalle2[];
}

export interface IPickingCopyToTransferenciaDetalle1 {
  id                    : number;
  baseType              : string;
  baseEntry             : number;
  baseLine              : number;
  u_FIB_IsPkg           : string;
  return                : string;
  itemCode              : string;
  dscription            : string;
  barcode               : string;
  fromWhsCod            : string;
  whsCode?              : string;
  u_tipoOpT12?          : string;
  u_tipoOpT12Nam?       : string;
  unitMsr               : string;
  quantity              : number;
  openQty               : number;
  bulto                 : number;
  peso                  : number;
}

export interface IPickingCopyToTransferenciaDetalle2 {
  idBase                : number;
  lineBase              : number;
  baseType              : string;
  baseEntry             : number;
  baseLine              : number;
  u_FIB_IsPkg           : string;
  itemCode              : string;
  dscription            : string;
  fromWhsCod            : string;
  whsCode?              : string;
  codTipOperacion?      : string;
  nomTipOperacion?      : string;
  unitMsr               : string;
  quantity              : number;
  openQty               : number;
  bulto                 : number;
  peso                  : number;
}

