export interface IStockTransfers {
  docEntry                : number;
  docNum                  : number;
  objType                 : string;
  docStatus               : string;
  u_FIB_FromPkg           : string;
  u_BPP_MDTD              : string;
  u_BPP_MDSD              : string;
  u_BPP_MDCD              : string;
  docDate                 : Date;
  taxDate                 : Date;
  cardCode?               : string;
  cardName?               : string;
  cntctCode?              : number;
  address                 : string;
  filler                  : string;
  toWhsCode               : string;

  u_FIB_TIP_TRANS         : string;
  u_FIB_COD_TRA           : string;
  u_FIB_TIPDOC_TRA        : string;
  u_BPP_MDRT              : string;
  u_BPP_MDNT              : string;
  u_BPP_MDVC              : string;

  u_FIB_TIPDOC_COND       : string;
  u_FIB_NUMDOC_COD        : string;
  u_FIB_NOM_COND          : string;
  u_FIB_APE_COND          : string;
  u_BPP_MDFN              : string;
  u_BPP_MDFC              : string;

  u_FIB_TIP_TRAS          : string;
  u_BPP_MDMT              : string;
  u_BPP_MDTS              : string;

  slpCode                 : number;
  u_FIB_NBULTOS           : number;
  u_FIB_KG                : number;
  jrnlMemo                : string;
  comments                : string;
  codStatusSunat          : string;
  nomdStatusSunat         : string;
  desSunat                : string;
  notSunat                : string;
  qtyRding                : number;
  lines                   : ITransferenciaStock1[];
}

export interface ITransferenciaStock1 {
  objType?            : string;
  docEntry?           : number;
  lineNum?            : number;
  baseType?           : number;
  baseEntry?          : number;
  baseLine?           : number;
  u_FIB_FromPkg?      : string;
  lineStatus?         : string;
  itemCode            : string;
  dscription          : string;
  fromWhsCod          : string;
  whsCode             : string;
  u_tipoOpT12         : string;
  u_tipoOpT12Nam?     : string;
  unitMsr             : string;
  quantity            : number;
  openQty             : number;
  u_FIB_NBulto?       : number;
  u_FIB_PesoKg?       : number;
}
