export class ExchangeRatesFindModel {
  rateDate?       : Date;
  currency        : string;
  sysCurrncy      : string;

  constructor(){
    this.rateDate     = null;
    this.currency     = '';
    this.sysCurrncy   = '';
  }
}
