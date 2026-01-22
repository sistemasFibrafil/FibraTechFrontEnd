export interface IPickingVenta {
  idPicking: number;
  numPicking: string;
  fecPicking: Date;
  codTipoPicking: string;
  codEstado: string;
  cardCode: string;
  comentarios: string;
  idUsuario: number;
  item: IPickingVentaItem[];
}


export interface IPickingVentaByFiltro {
  idPicking: number;
  numPicking: string;
  fecPicking: Date;
  nomTipoPicking: string;
  codEstado: string;
  nomEstado: string;
  cardCode: string;
  cardName: string;
}


export interface IPickingVentaByIdPicking {
  idPicking: number;
  numPicking: string;
  fecPicking: Date;
  codTipoPicking: string;
  codEstado: string;
  cardCode: string;
  cardName: string;
  licTradNum: string;
  comentarios: string;
  item: IPickingVentaItem[];
}


export interface IPickingVentaItem {
  idPicking: number;
  idPickingItem: number;
  lineNumItem: number;
  docEntry: number;
  docNum: number;
  lineNum: number;
  objType: string;
  itemCode: string;
  dscription: string;
  whsCode: string;

  idPickingBarCode: number;
  lineNumBarCode: number;
  barCode: string;
  unitMsr: string;
  quantity: number;
  peso: number;

  codEstado: string;
  idUsuario: number;
}

export interface IPickingVentaItemGrilla {
  idPicking: number;
  idPickingItem: number;
  lineNumItem: number,
  docEntry: number;
  docNum: number;
  lineNum: number;
  objType: string;
  itemCode: string;
  dscription: string;
  unitMsr: string;
  quantity: number;
  peso: number;
}
