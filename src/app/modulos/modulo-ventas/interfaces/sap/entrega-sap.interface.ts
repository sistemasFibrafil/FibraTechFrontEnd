export interface IEntregaSap {
  docEntry          : number;
  docNum            : number;

  item              : IEntregaItem[];
}


export interface IEntregaItem {
  docEntry          : number;
  lineNum           : number;
}

export interface IGuiaSapByFecha {
  fechaEmision                  : Date;
  tipo                          : string;
  serie                         : string;
  numero                        : string;

  clienteTipoDocumento          : string;
  clienteNumeroDocumento        : string;
  clienteDenominacion           : string;

  detalle                       : string;
  pesoBruto                     : string;
  pesoUnidadMedida              : string;
  fechaTraslado                 : Date;

  transportistaDocumentoTipo    : string;
  transportistaDocumentoNumero  : string;
  transportistaDenominacion     : string;
  transportistaPlacaNumero      : string;

  conductorDocumentoTipo        : string;
  conductorDocumentoNumero      : string;
  conductorNombre               : string;
  conductorApellidos            : string;
  conductorLicenciaNumero       : string;

  puntoPartidaUbigeo            : string;
  puntoPartidaDireccion         : string;
  puntoLlegadaUbigeo            : string;
  puntoLlegadaDireccion          : string;

  observaciones                 : string;
  estadoSunat                   : string;
}




