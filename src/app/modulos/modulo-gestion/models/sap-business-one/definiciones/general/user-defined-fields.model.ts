export class UserDefinedFieldsFindModel {
  tableID   : string;
  aliasID   : string;

  constructor(){
    this.tableID = '';
    this.aliasID = '';
    }
}

export class UserDefinedFieldsFilterModel {
  userDefinedFields : string;
  tableID           : string;
  aliasID           : string;

  constructor(){
    this.userDefinedFields = '';
    this.tableID = '';
    this.aliasID = '';
  }
}
