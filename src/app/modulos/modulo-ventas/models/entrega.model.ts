export class EntregaVentaCreateModel {
  docEntry                    : number;
  objType?                    : string;
  series                      : number;
  docNum                      : number;
  tipDocSunat?                : string;
  serieSunat                  : string;
  numeroSunat                 : string;
  docStatus                   : string;
  docDate?                    : Date;
  docDueDate?                 : Date;
  taxDate?                    : Date;

  cardCode                    : string;
  cardName                    : string;
  licTradNum                  : string;
  docCur                      : string;
  docRate                     : number;

  shipToCode                  : string;
  address2                    : string;
  payToCode                   : string;
  address                     : string;
  u_BPP_MDMT              : string;
  otrMotTraslado              : string;
  codCondicionPago            : number;

  rucDesInternacional         : string;
  desGuiaInternacional        : string;
  dirDesInternacional         : string;
  numContenedor               : string;
  numPrecinto01               : string;
  numPrecinto02               : string;
  numPrecinto03               : string;
  numPrecinto04               : string;

  //Transportista
  u_FIB_TIP_TRANS            : string;
  //Transportista 1
  manTransportista1           : boolean;
  codTransportista1           : string;
  codTipDocIdeTransportista1  : string;
  rucTransportista1           : string;
  u_BPP_MDNT1           : string;
  numPlaca1                   : string;
  codTipDocIdeConductor1      : string;
  numDocIdeConductor1         : string;
  denConductor1               : string;
  u_FIB_NOM_COND1               : string;
  u_FIB_APE_COND1               : string;
  licConductor1               : string;

  //Transportista 2
  manTransportista2           : boolean;
  codTransportista2           : string;
  rucTransportista2           : string;
  u_BPP_MDNT2           : string;
  dirTransportista2           : string;

  slpCode                     : number;
  totalBulto                  : number;
  totalKilo                   : number;
  comments                    : string;

  vatSum                      : number;
  vatSumFC                    : number;
  vatSumSy                    : number;

  docTotal                    : number;
  docTotalFC                  : number;
  docTotalSy                  : number;

  idUsuario                   : number;

  item                        : EntregaVentaItemCreateModel[];

  constructor(){
    this.docEntry                    = 0;
    this.objType                     = '15';
    this.series                      = 0;
    this.docNum                      = 0;
    this.tipDocSunat                 = '09';
    this.serieSunat                  = '';
    this.numeroSunat                 = '';
    this.docStatus                   = 'O';
    this.docDate                     = null;
    this.docDueDate                  = null;
    this.taxDate                     = null;

    this.cardCode                    = '';
    this.cardName                    = '';
    this.licTradNum                  = '';
    this.docCur                      = '';
    this.docRate                     = 0;

    this.shipToCode                  = '';
    this.address2                    = '';
    this.payToCode                   = '';
    this.address                     = '';
    this.u_BPP_MDMT              = '';
    this.otrMotTraslado              = '';

    this.codCondicionPago            = 0;

    this.rucDesInternacional         = '';
    this.desGuiaInternacional        = '';
    this.dirDesInternacional         = '';
    this.numContenedor               = '';
    this.numPrecinto01               = '';
    this.numPrecinto02               = '';
    this.numPrecinto03               = '';
    this.numPrecinto04               = '';

    this.u_FIB_TIP_TRANS            = '';
    this.manTransportista1           = false;
    this.codTransportista1           = '';
    this.codTipDocIdeTransportista1  = '';
    this.rucTransportista1           = '';
    this.u_BPP_MDNT1           = '';
    this.numPlaca1                   = '';
    this.codTipDocIdeConductor1      = '';
    this.numDocIdeConductor1         = '';
    this.denConductor1               = '';
    this.u_FIB_NOM_COND1               = '';
    this.u_FIB_APE_COND1               = '';
    this.licConductor1               = '';

    this.manTransportista2           = false
    this.codTransportista2           = '';
    this.rucTransportista2           = '';
    this.u_BPP_MDNT2           = '';
    this.dirTransportista2           = '';

    this.slpCode                     = 0;
    this.totalBulto                  = 0;
    this.totalKilo                   = 0;
    this.comments                    = '';
    this.vatSum                      = 0;
    this.vatSumFC                    = 0;
    this.vatSumSy                    = 0;
    this.docTotal                    = 0;
    this.docTotalFC                  = 0;
    this.docTotalSy                  = 0;

    this.idUsuario                   = 0;

    this.item                        = [];
  }
}

export class EntregaVentaItemCreateModel {
  lineNum           : number;
  objType?          : string;
  idBase            : number;
  lineBase          : number;
  baseType          : string;
  baseEntry         : number;
  baseLine          : number;
  itemCode          : string;
  dscription        : string;
  whsCode           : string;
  unitMsr           : string;
  quantity          : number;
  peso              : number;
  taxCode           : string;
  acctCode          : string;
  currency          : string;
  priceBefDi        : number;
  discPrcnt         : number;
  price             : number;
  lineTotal         : number;

  constructor(){
    this.lineNum           = 0;
    this.idBase            = 0;
    this.lineBase          = 0;
    this.objType           = '15';
    this.baseType          = '';
    this.baseEntry         = 0;
    this.baseLine          = 0;
    this.itemCode          = '';
    this.dscription        = '';
    this.whsCode           = '';
    this.unitMsr           = '';
    this.quantity          = 0;
    this.peso              = 0;
    this.taxCode           = '';
    this.acctCode          = '';
    this.currency          = '';
    this.priceBefDi        = 0;
    this.discPrcnt         = 0;
    this.price             = 0;
    this.lineTotal         = 0;
  }
}


export class EntregaFindModel {
  fecInicial: Date;
  fecFinal: Date;

  constructor(){
      this.fecInicial = null;
      this.fecFinal = null;
  }
}

export class EntregaEnviarModel {
  docEntry?: number;

  constructor(){
      this.docEntry = null;
  }
}

// export class DespachoMercaderiaSapByFechaSedeFindModel {
//   fecInicial: Date;
//   fecFinal: Date;
//   location: string;

//   constructor(){
//       this.fecInicial = null;
//       this.fecFinal = null;
//       this.location = '';
//   }
// }

