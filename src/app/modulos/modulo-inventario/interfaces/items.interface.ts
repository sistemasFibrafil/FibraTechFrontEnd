export interface IArticulo {
  itemCode        : string;
  itemName        : string;
  u_FIB_ItemCode  : string;
  u_FIB_ItemName  : string;
  itmsGrpCod      : number;
  invntItem       : string;
  sellItem        : string;
  prchseItem      : string;
  wTLiable        : string;
  vatLiable       : string;
  indirctTax      : string;
  frozenFor       : string;
  salUnitMsr      : string;
  buyUnitMsr      : string;
  invntryUom      : string;
  salPackUn       : number;
  dfltWH          : string;
  onHand          : number;
  taxCodeAR       : string;
  u_BPP_TIPEXIST  : string;
  u_BPP_TIPUNMED  : string;
  u_S_PartAranc1  : string;
  u_S_PartAranc2  : string;
  u_FIB_ECU       : string;
  u_S_CCosto      : string;
  u_FIB_PESO      : number;
  u_FIB_SGRUP     : string;
  u_FIB_SGRUPO2   : string;
  u_FIB_LINNEG    : string;

  u_tipoOpT12     : string;
  u_tipoOpT12Nam  : string;
}

export interface IArticuloQuery {
  itemCode        : string;
  itemName        : string;
  u_FIB_ItemCode  : string;
  u_FIB_ItemName  : string;
  itmsGrpCod      : number;
  invntItem       : string;
  sellItem        : string;
  prchseItem      : string;
  wTLiable        : string;
  vatLiable       : string;
  indirctTax      : string;
  frozenFor       : string;
  salUnitMsr      : string;
  buyUnitMsr      : string;
  invntryUom      : string;
  salPackUn       : number;
  dfltWH          : string;
  onHand          : number;
  taxCodeAR       : string;
  u_BPP_TIPEXIST  : string;
  u_BPP_TIPUNMED  : string;
  u_S_PartAranc1  : string;
  u_S_PartAranc2  : string;
  u_FIB_ECU       : string;
  u_S_CCosto      : string;
  u_FIB_PESO      : number;
  u_FIB_SGRUP     : string;
  u_FIB_SGRUPO2   : string;
  u_FIB_LINNEG    : string;

  acctCode        : string;
  formatCode      : string;
  acctName?       : string;

  u_tipoOpT12     : string;
  u_tipoOpT12Nam  : string;
}

export interface IArticuloReporte {
  itemCode        : string;
  itemName        : string;
  frozenFor       : string;
  dfltWH          : string;
  whsCode         : string;
  whsName         : string;
  buyUnitMsr      : string;
  salUnitMsr      : string;
  invntryUom      : string;
  onHand          : number;
  isCommited      : number;
  onOrder         : number;
  available       : number;
  pesoPromedioKg  : number;
  pesoKg          : number;
  statusCode      : string;
  statusName      : string;
  u_tipoOpT12     : string;
  u_tipoOpT12Nam  : string;
  fecProduccion?  : Date;
}

export interface IMovimientoStockByFechaSede {
  nomTipoMovimiento: string;
  numeroGuiaSAP: number;
  numeroGuiaSUNAT: string;
  docDate: Date;
  cardCode: string;
  cardName: string;
  usuario: string;
  itemCode: string;
  itemName: string;
  sede: string;
  centroCosto: string;
  almacenOrigen: string;
  almacenDestino: string;
  bulto: number;
  totalKg: number;
  unidadMedida: string;
  quantity: number;
  numeroPedido: number;
  fechaPedido: Date;
  numeroFacturaSAP: number;
  numeroFacturaSUNAT: string;
  u_BPP_MDNT: string;
  rucTransportista: string;
  placaTransportista: string;
  u_FIB_NOM_COND: string;
  lincenciaConductor: string;
}

export interface IArticuloVentaStockByGrupoSubGrupo {
  itemCode: string;
  itemName: string;
  nomGrupo: string;
  nomSubGrupo: string;
  nomSubGrupo2: string;
  unidadVenta: string;
  stock: number;
  comprometido: number;
  solicitado: number;
  disponible: number;
  pesoPromedioKg: number;
}

export interface IArticuloVentaByGrupoSubGrupoEstado {
  itemCode: string;
  itemName: string;
  nomGrupo: string;
  nomSubGrupo: string;
  nomSubGrupo2: string;
  nomEstado: string;
  unidadVenta: string;
  pesoItem: number;
  pesoPromedioKg: number;
}

export interface IArticuloDocumentoSap {
  itemCode        : string;
  itemName        : string;
  dfltWH          : string;
  buyUnitMsr      : string;
  salUnitMsr      : string;
  invntryUom      : string;
  onHand          : number;
  quantity        : number;
  openQty         : number;
  openQtyRead     : number;
  currency        : string;
  priceBefDi      : number;
  discPrcnt       : number;
  price           : number;
  taxCode         : string;
  vatPrcnt        : number;
  lineTotal       : number;
  vatSum          : number;
}
