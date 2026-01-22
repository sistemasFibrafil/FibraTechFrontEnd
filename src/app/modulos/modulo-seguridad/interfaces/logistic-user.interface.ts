export interface ILogisticUserQuery {
  idLogisticUser?           : number;
  idUsuario?                : number;
  idLocation?               : number;
  nombre                    : string;
  apellidoPaterno           : string;
  apellidoMaterno           : string;
  superUser                 : boolean;
  blocked                   : boolean;
  permissions               : ILogisticUserPermission[];
}

export interface ILogisticUserPermission {
  idLogisticUserPermission  : number;
  idLogisticUser            : number;
  objectType                : string;
  whsCode                   : string;
  toWhsCode                 : string;
  blocked                   : boolean;
}
