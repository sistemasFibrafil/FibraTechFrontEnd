export class TransferenciaStockFindModel {
  fecInicial: Date;
  fecFinal: Date;
  numero: string;

  constructor(){
      this.fecInicial = null;
      this.fecFinal = null;
      this.numero = '';
  }
}

export class TransferenciaStockEnviarModel {
  docEntry?: number;

  constructor(){
      this.docEntry = null;
  }
}
