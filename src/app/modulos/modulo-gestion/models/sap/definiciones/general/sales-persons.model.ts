export class SalesPersonsModel {
  slpCode   : number;
  slpName?  : string;

  constructor(){
    this.slpCode = -1;
    this.slpName = '';
    }
}
