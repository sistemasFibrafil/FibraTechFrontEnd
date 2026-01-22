export class PickingByFiltroFindModel {
  fecInicial: Date;
  fecFinal: Date;

  constructor(){
      this.fecInicial = null;
      this.fecFinal= null;
  }
}

export class PickingDeleteModel {
  idPicking : number;
  idUsuario : number;

  constructor(){
      this.idPicking  = 0;
      this.idUsuario  = 0;
  }
}


export class PickingItemDeleteAllModel {
  idPicking : number;
  docEntry  : number;
  objType   : string;
  lineNum   : number;
  itemCode  : string;
  idUsuario : number;

  constructor(){
      this.idPicking  = 0;
      this.docEntry   = 0;
      this.objType    = '';
      this.lineNum    = 0;
      this.itemCode   = '';
      this.idUsuario  = 0;
  }
}
