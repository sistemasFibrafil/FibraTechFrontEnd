export class SopCreateModel {
  id                        : number;
  codYear                   : number;
  codMonth                  : number;
  codWeek                   : number;
  name                      : string;
  comments                  : string;
  idUsuarioCreate           : number;
  linea                     : SopDetalleCreateModel[];

  constructor(){
    this.id                 = 0;
    this.codYear            = 0;
    this.codMonth           = 0;
    this.codWeek            = 0;
    this.name               = '';
    this.comments           = '';
    this.idUsuarioCreate    = 0;
    this.linea              = [];
  }
}

export class SopDetalleCreateModel {
  id?                       : number;
  docEntry                  : number;
  lineNum                   : number;
  docNum                    : number;
  docDate                   : Date;
  codTipDocumento           : string;
  nomTipDocumento           : string;
  cardCode                  : string;
  cardName                  : string;
  codOriCliente             : string;
  nomOriCliente             : string;
  slpCode                   : number;
  slpName                   : string;
  itemCode                  : string;
  itemName                  : string;
  codLinNegocio             : string;
  nomLinNegocio             : string;
  codGpoArticulo            : number;
  nomGpoArticulo            : string;
  salUnitMsr                : string;
  stock                     : number;
  qtyEarring                : number;
  pesoPromedioKg            : number;
  kgEarring                 : number;
  price                     : number;
  lineTotEarring            : number;
  codConPago                : number;
  nomConPago                : string;
  fecEntFinal?              : Date;
  fecEntProdProceso?        : Date;
  idUsuarioCreate           : number;

  constructor(){
    this.id                 = 0;
    this.docEntry           = 0;
    this.lineNum            = 0;
    this.docNum             = 0;
    this.docDate            = null;
    this.codTipDocumento    = '';
    this.nomTipDocumento    = '';
    this.cardCode           = '';
    this.cardName           = '';
    this.codOriCliente      = '';
    this.nomOriCliente      = '';
    this.slpCode            = 0;
    this.slpName            = '';
    this.itemCode           = '';
    this.itemName           = '';
    this.codLinNegocio      = '';
    this.nomLinNegocio      = '';
    this.codGpoArticulo     = 0;
    this.nomGpoArticulo     = '';
    this.stock              = 0;
    this.qtyEarring         = 0;
    this.pesoPromedioKg     = 0;
    this.kgEarring          = 0;
    this.price              = 0;
    this.lineTotEarring     = 0;
    this.codConPago         = 0;
    this.nomConPago         = '';
    this.fecEntFinal        = null;
    this.fecEntProdProceso  = null;
    this.idUsuarioCreate    = 0;
  }
}


export class SopUpdateModel {
  id                        : number;
  codYear                   : number;
  codMonth                  : number;
  codWeek                   : number;
  name                      : string;
  comments                  : string;
  idUsuarioUpdate           : number;
  linea                     : SopDetalleUpdateModel[];

  constructor(){
    this.id                 = 0;
    this.codYear            = 0;
    this.codMonth           = 0;
    this.codWeek            = 0;
    this.name               = '';
    this.comments           = '';
    this.idUsuarioUpdate    = 0;
    this.linea              = [];
  }
}

export class SopDetalleUpdateModel {
  id?                       : number;
  line?                     : number;
  docEntry                  : number;
  lineNum                   : number;
  order                     : number;
  docNum                    : number;
  docDate                   : Date;
  codTipDocumento           : string;
  nomTipDocumento           : string;
  cardCode                  : string;
  cardName                  : string;
  codOriCliente             : string;
  nomOriCliente             : string;
  slpCode                   : number;
  slpName                   : string;
  itemCode                  : string;
  itemName                  : string;
  codLinNegocio             : string;
  nomLinNegocio             : string;
  codGpoArticulo            : number;
  nomGpoArticulo            : string;
  salUnitMsr                : string;
  stock                     : number;
  qtyEarring                : number;
  pesoPromedioKg            : number;
  kgEarring                 : number;
  price                     : number;
  lineTotEarring            : number;
  codConPago                : number;
  nomConPago                : string;
  fecEntFinal?              : Date;
  fecEntProdProceso?        : Date;
  record?                   : number;
  idUsuarioCreate           : number;
  idUsuarioUpdate?          : number;

  constructor(){
    this.id                 = 0;
    this.line               = 0;
    this.docEntry           = 0;
    this.lineNum            = 0;
    this.order              = 0;
    this.docNum             = 0;
    this.docDate            = null;
    this.codTipDocumento    = '';
    this.nomTipDocumento    = '';
    this.cardCode           = '';
    this.cardName           = '';
    this.codOriCliente      = '';
    this.nomOriCliente      = '';
    this.slpCode            = 0;
    this.slpName            = '';
    this.itemCode           = '';
    this.itemName           = '';
    this.codLinNegocio      = '';
    this.nomLinNegocio      = '';
    this.codGpoArticulo     = 0;
    this.nomGpoArticulo     = '';
    this.stock              = 0;
    this.qtyEarring         = 0;
    this.pesoPromedioKg     = 0;
    this.kgEarring          = 0;
    this.price              = 0;
    this.lineTotEarring     = 0;
    this.codConPago         = 0;
    this.nomConPago         = '';
    this.fecEntFinal        = null;
    this.fecEntProdProceso  = null;
    this.record             = 0;
    this.idUsuarioCreate    = null;
    this.idUsuarioUpdate    = null;
  }
}

export class SopDeleteModel {
  id?                       : number;

  constructor(){
    this.id                 = 0;
  }
}

export class SopDetalleDeleteModel {
  id?                       : number;
  line?                     : number;

  constructor(){
    this.id                 = 0;
    this.line               = 0;
  }
}
