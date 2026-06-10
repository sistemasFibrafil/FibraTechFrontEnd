export interface IAddresses {
  lineNum?        : number;
  address         : string;
  adresType       : string;
  // País
  country         : string;
  // Ubigeo
  glblLocNum      : string;
  //Departamento
  state           : string;
  // Provincia
  county          : string;
  // Distrito
  city            : string;
  // Calle
  street          : string;
  // Impuesto
  taxCode         : string;
  fullAddress?    : string;
  default?        : string;
  record?         : number;
}
