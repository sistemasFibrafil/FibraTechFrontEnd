export class DocumentSeriesConfigurationCreateModel {
  code                      : string;
  u_IdUser                  : number;
  u_Active                  : string;
  lines                     : DocumentSeriesConfiguration1CreateModel[];

  constructor(){
    this.code              = '';
    this.u_IdUser          = 0;
    this.u_Active          = '';
    this.lines             = [];
  }
}

export class DocumentSeriesConfiguration1CreateModel {
  code                      : string;
  lineId                    : number;
  u_Type                    : string;
  u_Series                  : string;
  u_SalesInvoices           : string;
  u_Delivery                : string;
  u_Transfer                : string;
  u_Default                 : string;
  u_Active                  : string;
  record                    : number;

  constructor(){
    this.code                      = '';
    this.lineId                    = 0;
    this.u_Type                    = '';
    this.u_Series                  = '';
    this.u_SalesInvoices           = '';
    this.u_Delivery                = '';
    this.u_Transfer                = '';
    this.u_Default                 = '';
    this.u_Active                  = '';
    this.record                    = 1;
  }
}

export class DocumentSeriesConfigurationFindModel {
  idUsuario                 : number;

  constructor(){
    this.idUsuario         = 0;
  }
}
