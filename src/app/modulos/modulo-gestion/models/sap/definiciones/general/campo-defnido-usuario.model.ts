export class CampoDefinidoUsuarioFindModel {
  tableID   : string;
  aliasID   : string;

  constructor(){
    this.tableID = '';
    this.aliasID = '';
    }
}

export class CampoDefinidoUsuarioFilterModel {
  userDefinedFields : string;
  tableID           : string;
  aliasID           : string;

  constructor(){
    this.userDefinedFields = '';
    this.tableID = '';
    this.aliasID = '';
  }
}
