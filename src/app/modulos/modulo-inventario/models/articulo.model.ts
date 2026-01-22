export class ArticuloModel {
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
  salUnitMsr      : string;
  buyUnitMsr      : string;
  invntryUom      : string;
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
  u_UsrCreate     : number;

  isEntrada       : boolean;
  isSalida        : boolean;
  line            : ArticuloModel[];

  constructor(){
      this.itemCode         = '';
      this.itemName         = '';
      this.u_FIB_ItemCode   = '';
      this.u_FIB_ItemName   = '';
      this.itmsGrpCod       = 0;
      this.invntItem        = '';
      this.sellItem         = '';
      this.prchseItem       = '';
      this.wTLiable         = '';
      this.vatLiable        = '';
      this.indirctTax       = '';
      this.salUnitMsr       = '';
      this.buyUnitMsr       = '';
      this.invntryUom       = '';
      this.dfltWH           = '';
      this.onHand           = 0;
      this.taxCodeAR        = '';
      this.u_BPP_TIPEXIST   = '';
      this.u_BPP_TIPUNMED   = '';
      this.u_S_PartAranc1   = '';
      this.u_S_PartAranc2   = '';
      this.u_FIB_ECU        = '';
      this.u_S_CCosto       = '';
      this.u_FIB_PESO       = 0;
      this.u_FIB_SGRUP      = '';
      this.u_FIB_SGRUPO2    = '';
      this.u_FIB_LINNEG     = '';
      this.line             = [];
  }
}


export class ArticuloFiltroFindModel {
  itemCode: string;
  itemName: string;

  constructor(){
      this.itemCode = '';
      this.itemName = '';
  }
}


export class ArticuloVentaByGrupoSubGrupoEstadoFindModel {
  grupo: string;
  subGrupo: string;
  subGrupo2: string;
  estado: string;

  constructor(){
      this.grupo = '';
      this.subGrupo = '';
      this.subGrupo2 = '';
      this.estado = '';
  }
}


export class ArticuloSapForSodimacBySkuModel {
  linea                           : ArticuloSapForSodimacBySkuItemModel[];

  constructor(){
      this.linea                  = [];
  }
}

export class ArticuloSapForSodimacBySkuItemModel {
  line                           : number;
  numLocal                       : number;
  nomLocal                       : string;
  codEstado                      : string;
  sku                            : string;
  dscriptionLarga                : string;
  ean                            : string;
  quantity                       : number;

  constructor(){
      this.line                  = 0;
      this.numLocal              = 0;
      this.nomLocal              = '';
      this.codEstado             = '';
      this.sku                   = '';
      this.dscriptionLarga       = '';
      this.ean                   = '';
      this.quantity              = 0;
  }
}


export class MovimientoStokByFechaSedeFindModel {
  startDate                      : Date;
  endDate                        : Date;
  location                       : string;
  typeMovement                   : string;
  customer                       : string;
  item                           : string;

  constructor(){
      this.startDate            = null;
      this.endDate              = null;
      this.location             = '';
      this.typeMovement         = '';
      this.customer             = '';
      this.item                 = '';
  }
}


