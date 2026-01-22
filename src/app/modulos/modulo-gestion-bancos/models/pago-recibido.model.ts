export class PagoRecibidoByFilterFindModel {
  courtDate                       : Date;
  businessPartnerGroup            : string;
  customer?                       : string;

  constructor(){
      this.courtDate              = null;
      this.businessPartnerGroup   = null;
      this.customer               = '';
  }
}
