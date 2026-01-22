export class TipoCambioFindModel {
  rateDate?       : Date;
  currency        : string;
  sysCurrncy      : string;

  constructor(){
    this.rateDate     = null;
    this.currency     = '';
    this.sysCurrncy   = '';
  }
}
