export class LogisticUserModel {
  idLogisticUser            : number;
  idUsuario                 : number;
  idLocation?               : number;
  nombre                    : string;
  apellidoPaterno           : string;
  apellidoMaterno           : string;
  superUser                 : boolean;
  blocked                   : boolean;
  permissions               : LogisticUserPermissionModel[];

  constructor(){
    this.idLogisticUser      = 0;
    this.idUsuario           = 0;
    this.idLocation          = null;
    this.nombre              = '';
    this.apellidoPaterno     = '';
    this.apellidoMaterno     = '';
    this.superUser           = false;
    this.blocked             = false;
    this.permissions         = [];
  }
}

export class LogisticUserPermissionModel {
  idLogisticUserPermission  : number;
  idLogisticUser            : number;
  objectType                : string;
  whsCode                   : string;
  toWhsCode                 : string;
  blocked                   : boolean;

  constructor(){
    this.idLogisticUserPermission  = 0;
    this.idLogisticUser            = 0;
    this.objectType                = '';
    this.whsCode                   = '';
    this.toWhsCode                 = '';
    this.blocked                   = false;
  }
}
