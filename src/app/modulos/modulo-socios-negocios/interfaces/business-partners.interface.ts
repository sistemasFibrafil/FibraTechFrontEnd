
import { IDrivers } from "./drivers.interface";
import { IAddresses } from "./addresses.interface";
import { IVehicles } from "./vehicles.interface";
import { ICurrencyCodes } from "@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/finanzas/currency-codes.interface";
import { IBusinessPartnerGroups } from "@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/socio-negocios/business-partner-groups.interface";
import { IContactEmployees } from "./contact-employees.interface";

export interface IBusinessPartners {
  cardCode            : string;
  licTradNum          : string;
  docType             : string;
  cardName            : string;
  groupCode           : number;
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
  cardCode              : string;
  licTradNum            : string;
  cardType              : string;
  cardName              : string;
  groupCode             : number;
  groupsLines           : IBusinessPartnerGroups[];
  currency              : string;
  currencyCodesLines    : ICurrencyCodes[];

  u_BPP_BPTP            : string;
  u_BPP_BPTD            : string;
  u_FIB_Divi            : string;
  u_FIB_Sector          : string;


  phone1                : string;
  phone2                : string;
  cellular              : string;
  email                 : string;
  validFor              : string;
  slpCode               : number;
  slpName               : string;
  notes                 : string;

  cntctCode             : number;
  cntctPrsn             : string;
  contactEmployeesLines : IContactEmployees[];

  billToDef             : string;
  payAddressLines       : IAddresses[];
  address               : string;
  shipToDef             : string;
  shipAddressLines      : IAddresses[];
  ddress2               : string;

  groupNum              : number;
  groupName             : string;
  listNum               : number;
  creditLine            : number;
  debtLine              : number;

  u_BPP_BPAT            : string;
  u_FIB_EMAIL2          : string;
  u_FIB_EMAIL3          : string;
  u_BPP_BPNO            : string;
  u_BPP_BPAP            : string;
  u_BPP_BPAM            : string;

  vehiclesLines         : IVehicles[];
  driversLines          : IDrivers[];

  unidadNegocio         : string;
  nomSector             : string;
  nomDivision           : string;
  nomContacto           : string;
  createDate            : Date;
  lowDate?              : Date;
  fechaUltimaVenta      : Date;
  codStatus             : string;
  nomStatus             : string;
}


