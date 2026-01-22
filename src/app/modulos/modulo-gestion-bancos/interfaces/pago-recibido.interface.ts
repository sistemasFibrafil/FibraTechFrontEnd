export interface ICobranzaCarteraVencidaByFilter {
  numeroAsiento     : number;
  numeroSAP         : number;
  tipoDocumento     : string;
  numeroDocumento   : string;
  docDate           : Date;
  taxDate           : Date;
  dueDate           : Date;
  comments          : string;
  segment_0         : string;
  condicionPago     : string;
  cardCode          : string;
  cardName          : string;
  groupName         : string;
  creditLine        : number;
  slpName           : string;
  moneda            : string;
  saldoSOL          : number;
  saldoUSD          : number;
  saldoSYS          : number;
  de_0_15_Dias      : number;
  de_16_30_Dias     : number;
  de_31_60_Dias     : number;
  mas_60_Dias       : number;
}
