export class OrdenVentaSodimacCreateModel {
  id                        : number;
  docEntry                  : number;
  docNum                    : number;
  numOrdenCompra            : string;
  docStatus                 : string;
  docDate                   : Date;
  docDueDate                : Date;
  taxDate                   : Date;
  cardCode                  : string;
  cardName                  : string;
  cntctCode                 : number;
  cntctName                 : string;
  address                   : string;
  idUsuarioCreate           : number;
  item                      : OrdenVentaSodimacDetalleCreateModel[];

  constructor(){
      this.id               = 0;
      this.docEntry         = 0;
      this.docNum           = 0;
      this.numOrdenCompra   = '';
      this.docStatus        = '';
      this.docDate          = null;
      this.docDueDate       = null;
      this.taxDate          = null;
      this.cardCode         = '';
      this.cardName         = '';
      this.cntctCode        = 0;
      this.cntctName        = '';
      this.address          = '';
      this.idUsuarioCreate  = 0;
      this.item             = [];
  }
}
export class OrdenVentaSodimacDetalleCreateModel {
  id                        : number;
  line2                     : number;
  numLocal                  : number;
  isOriente                 : boolean;
  lineStatus                : string;
  itemCode                  : string;
  sku                       : string;
  dscription                : string;
  dscriptionLarga           : string;
  ean                       : string;
  quantity                  : number;

  constructor(){
    this.id                 = 0;
    this.line2              = 0;
    this.numLocal           = 0;
    this.isOriente          = false;
    this.lineStatus         = '';
    this.itemCode           = '';
    this.sku                = '';
    this.dscription         = '';
    this.dscriptionLarga    = '';
    this.ean                = '';
    this.quantity           = 0;
      }
}

export class OrdenVentaSodimacUpdateModel {
  id                        : number;
  idUsuarioUpdate           : number;
  item                      : OrdenVentaSodimacDetalleUpdateModel[];

  constructor(){
      this.id               = 0;
      this.idUsuarioUpdate  = 0;
      this.item             = [];
  }
}
export class OrdenVentaSodimacDetalleUpdateModel {
  id                        : number;
  line1                     : number;
  isOriente                 : boolean;

  constructor(){
    this.id                 = 0;
    this.line1              = 0;
    this.isOriente          = false;
      }
}



export class OrdenVentaSodimacLpnUpdateModel {
  id                      : number;
  item                    : OrdenVentaDetalleSodimacLpnUpdateModel[];

  constructor(){
      this.id             = 0;
      this.item           = [];
  }
}
export class OrdenVentaDetalleSodimacLpnUpdateModel {
  id                      : number;
  line2                   : number;
  numLocal                : number;

  constructor(){
      this.id             = 0;
      this.line2          = 0;
      this.numLocal       = 0;
  }
}
