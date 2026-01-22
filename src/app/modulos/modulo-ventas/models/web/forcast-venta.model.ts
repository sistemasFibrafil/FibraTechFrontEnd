export class ForcastventaFindModel {
  fecInicial: Date;
  fecFinal: Date;

  constructor(){
      this.fecInicial = null;
      this.fecFinal= null;
  }
}

export class ForcastventaImportModel {
  idUsuario: number;
  item: any[];

  constructor(){
      this.idUsuario = 0;
      this.item = [];
  }
}
