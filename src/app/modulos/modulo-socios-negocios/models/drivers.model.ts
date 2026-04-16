export class DriversCreateModel {
  cardCode      : string;
  lines         : Drivers1CreateModel[];

  constructor(){
    this.cardCode   = '';
    this.lines      = [];
  }
}

export class Drivers1CreateModel {
  code        : string;
  name        : string;
  u_BPP_CHNO  : string;
  u_FIB_CHAP  : string;
  u_FIB_CHTD  : string;
  u_FIB_CHND  : string;
  u_BPP_CHLI  : string;
  u_FIB_COTR  : string;
  record      : number;

  constructor(){
    this.code             = '';
    this.name             = '';
    this.u_BPP_CHNO       = '';
    this.u_FIB_CHAP       = '';
    this.u_FIB_CHTD       = '';
    this.u_FIB_CHND       = '';
    this.u_BPP_CHLI       = '';
    this.u_FIB_COTR       = '';
    this.record           = 0;
  }
}
