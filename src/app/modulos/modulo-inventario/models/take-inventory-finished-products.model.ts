export class TakeInventoryFinishedProductsCreateModel {
  createDate  : Date;
  whsCode     : string;
  codeBar     : string;
  usrCreate   : number

  constructor(){
      this.createDate = new Date();
      this.whsCode    = '';
      this.codeBar    = '';
      this.usrCreate  = 0;
  }
}

export class TakeInventoryFinishedProductsFilterModel {
  startDate : Date;
  endDate   : Date;
  usuario   : string
  whsCode   : string
  item      : string;

  constructor(){
      this.startDate  = null;
      this.endDate    = null;
      this.usuario    = '';
      this.whsCode    = '';
      this.item       = '';
  }
}
export class TakeInventoryFinishedProductsToCopyFindModel {
  startDate : Date;
  endDate   : Date;
  usuario   : string
  whsCode   : string
  item      : string;
  itemCode  : string;

  constructor(){
      this.startDate  = null;
      this.endDate    = null;
      this.usuario    = '';
      this.whsCode    = '';
      this.item       = '';
      this.itemCode   = '';
  }
}


export class TakeInventoryFinishedProductsFindModel {
  createDate  : Date;
  whsCode     : string;
  usrCreate   : number;

  constructor(){
      this.createDate   = null;
      this.whsCode      = '';
      this.usrCreate    = 0;
  }
}

