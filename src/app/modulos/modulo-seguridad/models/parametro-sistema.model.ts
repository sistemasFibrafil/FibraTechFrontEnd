export class ParametroSistemaModel {
    idParametrosSistema?: number;

    tipoAutenticacion: string;
    flgDimensionSAP:boolean;
    idDimensionSAP: number;
    flgGoogleDrive:boolean;
    flgDobleAutenticacion: boolean;
    
    sendEmail: string;
    sendEmailPasswordOrigen: string;
    sendEmailPort: number;
    sendEmailEnabledSSL: boolean;
    sendEmailHost: string;

    sendEmailFinanza: string;
    sendEmailFinanzaPasswordOrigen: string;
    sendEmailFinanzaPort: number;
    sendEmailFinanzaEnabledSSL: boolean;
    sendEmailFinanzaHost: string;

    asuntoFinanza: string;
    cuerpoFinanza: string;
    diasPorVencerFinanza: number;
    horaEnvioFinanza: string;
    
    emailGoogleDrive: string;
    emailPassword: string;

    // Auditoria
    regUsuario?: number;
    regEstacion?: string;

    constructor(){
        this.idParametrosSistema = 0;

        this.tipoAutenticacion = '';
        this.flgDimensionSAP = false;
        this.idDimensionSAP = 0;
        this.flgGoogleDrive = false;

        this.sendEmail = '';
        this.sendEmailPasswordOrigen = '';
        this.sendEmailPort = 0;
        this.sendEmailEnabledSSL = false;
        this.sendEmailHost = '';

        this.sendEmailFinanza = '';
        this.sendEmailFinanzaPasswordOrigen = '';
        this.sendEmailFinanzaPort = 0;
        this.sendEmailFinanzaEnabledSSL = false;
        this.sendEmailFinanzaHost = '';

        this.asuntoFinanza = '';
        this.cuerpoFinanza = '';
        this.diasPorVencerFinanza = 0;
        this.horaEnvioFinanza = '';

        this.emailGoogleDrive = '';
        this.emailPassword = '';
        this.regUsuario = 0;
        this.regEstacion = '';
    }
}