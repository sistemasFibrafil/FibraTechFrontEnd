
import { IMoneda } from "../../modulo-gestion/interfaces/sap-business-one/definiciones/finanzas/moneda.interface";
import { IDrivers } from "./drivers.interface";
import { IAddresses } from "./addresses.interface";
import { IVehicles } from "./vehicles.interface";

export interface IBusinessPartners {
  cardCode            : string;
  licTradNum          : string;
  docType             : string;
  cardName            : string;
  u_BPP_BPTD          : string;
  unidadNegocio       : string;
  creditLine          : number;
  slpCode             : number;
  slpName             : string;
  cntctCode           : number;
  cntctPrsn           : string;
  currency            : string;

  groupNum            : number;

  billToDef           : string;
  address             : string;
  shipToDef           : string;
  //address2            : string;

  nomSector           : string;
  nomDivision         : string;
  nomContacto         : string;
  createDate          : Date;
  lowDate?            : Date;
  fechaUltimaVenta    : Date;
  codStatus           : string;
  nomStatus           : string;
}

export interface IBusinessPartnersQuery {
  cardCode            : string;
  licTradNum          : string;
  docType             : string;
  cardName            : string;
  u_BPP_BPTD          : string;
  u_BPP_BPAT          : string;
  unidadNegocio       : string;
  creditLine          : number;
  slpCode             : number;
  slpName             : string;
  cntctCode           : number;
  cntctPrsn           : string;
  currency            : string;
  linesCurrency       : IMoneda[];

  groupNum            : number;
  groupName           : string;

  billToDef           : string;
  linesPayAddress     : IAddresses[];
  address             : string;
  shipToDef           : string;
  linesShipAddress    : IAddresses[];
  ddress2             : string;

  linesVehicles       : IVehicles[];
  linesDrivers        : IDrivers[];

  nomSector           : string;
  nomDivision         : string;
  nomContacto         : string;
  createDate          : Date;
  lowDate?            : Date;
  fechaUltimaVenta    : Date;
  codStatus           : string;
  nomStatus           : string;
}


