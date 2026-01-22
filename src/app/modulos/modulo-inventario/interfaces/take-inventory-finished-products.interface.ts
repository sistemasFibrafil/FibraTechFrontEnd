export interface ITakeInventoryFinishedProducts {
  docEntry              : number;
  itemCode?             : string;
  dscription?           : string;
  whsCode               : string;
  unitMsr               : string;
  onHandSys             : number;
}


export interface ITakeInventoryFinishedProducts1 {
  docEntry              : number;
  lineId                : number;
  codeBar               : string;
  productionDate        : Date;
  quantity              : number;
  weightKg              : number;
}


export interface ITakeInventoryFinishedProductsQuery {
  docEntry              : number;
  itemCode?             : string;
  dscription?           : string;
  whsCode               : string;
  unitMsr               : string;
  onHandSys             : number;
  onHandPhy             : number;
  difference            : number;
  quantity              : number;
  weightKg              : number;
}
