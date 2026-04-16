export interface IDocumentSeriesConfigurationQuery {
  code                      : string;
  u_IdUser                  : number;
  apellidoPaterno           : string;
  apellidoMaterno           : string;
  nombre                    : string;
  u_Active                  : boolean;
  lines                     : IDocumentSeriesConfiguration1Query[];
}

export interface IDocumentSeriesConfiguration1Query {
  code                      : string;
  lineId                    : number;
  u_Type                    : string;
  u_Series                  : string;
  u_SalesInvoices           : boolean;
  u_Delivery                : boolean;
  u_Transfer                : boolean;
  u_Default                 : boolean;
  u_Active                  : boolean;
  record                    : number;
}
