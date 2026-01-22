import { IMoneda } from "../../modulo-gestion/interfaces/sap/definiciones/finanzas/moneda.interface";
import { IDireccion } from "./direccion.interface";

export interface ISocioNegocio {
  cardCode            : string;
  licTradNum          : string;
  docType             : string;
  cardName            : string;
  unidadNegocio       : string;
  creditLine          : number;
  slpCode             : number;
  slpName             : string;
  cntctCode           : number;
  cntctPrsn           : string;
  currency            : string;
  currencyList        : IMoneda[];

  groupNum            : number;

  billToDef           : string;
  payAddressList      : IDireccion[];
  address             : string;
  shipToDef           : string;
  shipAddressList     : IDireccion[];
  address2            : string;

  nomSector           : string;
  nomDivision         : string;
  nomContacto         : string;
  createDate          : Date;
  lowDate?            : Date;
  fechaUltimaVenta    : Date;
  codStatus           : string;
  nomStatus           : string;
}
