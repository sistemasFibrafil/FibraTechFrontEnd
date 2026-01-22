export class VentaByFilterFindModel {
  startDate               : Date;
  endDate                 : Date;
  salesEmployee           : string;
  customer?               : string;
  item?                   : string;

  constructor(){
      this.startDate      = null;
      this.endDate        = null;
      this.salesEmployee  = '';
      this.customer       = '';
      this.item           = '';
  }
}

export class FacturaVentaByFilterFindModel {
  startDate               : Date;
  endDate                 : Date;
  customer?               : string;

  constructor(){
      this.startDate      = null;
      this.endDate        = null;
      this.customer       = '';
  }
}
