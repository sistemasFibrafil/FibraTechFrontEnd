export class UsuarioModel {
    idUsuario?                  : number;
    idPerfil?                   : number;
    idUserSap?                   : number;
    nombre                      : string;
    apellidoPaterno?            : string;
    apellidoMaterno?            : string;
    nombreCompleto?             : string;
    nroDocumento?               : string;
    nroTelefono?                : string;
    descripcionPerfil?          : string;
    usuario                     : string;
    clave                       : string;
    email                       : string;
    imagen                      : string;
    themeDark                   : boolean;
    themeColor                  : string;
    typeMenu                    : string;
    activo                      : boolean;
    // Auditoria
    regUsuario?                 : number;
    regEstacion?                : string;

    constructor(){
      this.idUsuario            = 0;
      this.idPerfil             = 0;
      this.nombre               = '';
      this.apellidoPaterno      = '';
      this.apellidoMaterno      = '';
      this.nombreCompleto       = '';
      this.nroDocumento         = '';
      this.nroTelefono          = '';
      this.descripcionPerfil    = '';
      this.usuario              = '';
      this.clave               = '';
      this.email                = '';
      this.imagen               = '';
      this.themeDark            = false;
      this.themeColor           = '';
      this.typeMenu             = '';
      this.activo               = true;
      this.regUsuario           = 0;
      this.regEstacion          = '';
    }
}
