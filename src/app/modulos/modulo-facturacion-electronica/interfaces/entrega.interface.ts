export interface IEntregaLocalElectronica {
  docEntry                      : number;
  docNum                        : number;
  objType                       : string;
  codStatusSunat                : string;
  nomStatusSunat                : string;

  numeroDocumento               : string;
  clienteNumeroDocumento        : string;
  clienteNombre                 : string;
  clienteNombreInter            : string;

  fechaEmision                  : Date;
  fechaEntrega                  : Date;
}
