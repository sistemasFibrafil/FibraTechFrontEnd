export class SerieNumeracionModel {
  codSerieNumeracion    : string;
  u_BPP_MDTD          : string;
  u_BPP_MDSD          : string;
  u_BPP_MDCD          : string;
  maxNumDocumento       : string;
  codSede               : number;
  codFormulario         : number;
  idUsuario             : number;
  linea                 : SerieNumeracionActionModel[]

  constructor(){
    this.codSerieNumeracion = '';
    this.u_BPP_MDTD       = '';
    this.u_BPP_MDSD       = '';
    this.u_BPP_MDCD       = '';
    this.maxNumDocumento    = '';
    this.codSede            = 0;
    this.codFormulario      = 0;
    this.idUsuario          = 0;
    this.linea              = [];
  }
}

export class SerieNumeracionActionModel {
  codSerieNumeracion    : string;
  u_BPP_MDTD          : string;
  u_BPP_MDSD          : string;
  u_BPP_MDCD          : string;
  maxNumDocumento       : string;
  codSede               : number;
  codFormulario         : number;
  idUsuario             : number;
  record                : number;

  constructor(){
    this.codSerieNumeracion = '';
    this.u_BPP_MDTD       = '';
    this.u_BPP_MDSD       = '';
    this.u_BPP_MDCD       = '';
    this.maxNumDocumento    = '';
    this.codSede            = 0;
    this.codFormulario      = 0;
    this.idUsuario          = 0;
    this.record             = 0;
  }
}
