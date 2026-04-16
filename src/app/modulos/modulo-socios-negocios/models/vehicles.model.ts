export class VehiclesCreateModel {
  cardCode      : string;
  lines         : Vehicles1CreateModel[];

  constructor(){
    this.cardCode   = '';
    this.lines      = [];
  }
}

export class Vehicles1CreateModel {
  code        : string;
  name        : string;
  u_BPP_VEPL  : string;
  u_BPP_VEMA  : string;
  u_BPP_VEMO  : string;
  u_BPP_VEAN  : string;
  u_BPP_VECO  : string;
  u_BPP_VESE  : string;
  u_BPP_VEPM  : number;
  u_FIB_COTR  : string;
  record      : number;

  constructor(){
    this.code             = '';
    this.name             = '';
    this.u_BPP_VEPL       = '';
    this.u_BPP_VEMA       = '';
    this.u_BPP_VEMO       = '';
    this.u_BPP_VEAN       = '';
    this.u_BPP_VECO       = '';
    this.u_BPP_VESE       = '';
    this.u_BPP_VEPM       = 0;
    this.u_FIB_COTR       = '';
    this.record           = 0;
  }
}
