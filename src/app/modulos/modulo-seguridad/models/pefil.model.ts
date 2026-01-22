export class PerfilModel {
    idPerfil?: number;
    descripcionPerfil: string;
    activo?: boolean;

    // Auditoria
    regUsuario?: number;
    regEstacion?: string;

    constructor(){
        this.idPerfil = 0;
        this.descripcionPerfil = '';
        this.activo = true;
        this.regUsuario = 0;
        this.regEstacion = '';
    }
}
