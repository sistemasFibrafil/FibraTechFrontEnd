export interface IStockTransfers {
    docEntry: number;
    docNum: number;

    serieDocumento: string;
    numeroDocumento: string;
    clienteTipoDocumento: string;
    clienteNumeroDocumento: string;
    clienteDenominacion: string;
    clienteDireccion: string;
    clienteEmail: string;
    fechaEmision: Date;
    fechaInicioTraslado: Date;
    fechaEntrega: Date;
    motivoTraslado: string;
    pesoBrutoTotal: number;
    numeroBultos: number;
    tipoTransporte: string;

    transportistaDocumentoNumero: string;
    transportistaDenominacion: string;
    transportistaPlacaNumero: string;

    conductorDocumentoTipo: string;
    conductorDocumentoNumero: string;
    conductorDenominacion: string;
    conductorNombre: string;
    conductorApellidos: string;
    conductorNumeroLicencia: string;

    puntoPartidaDireccion: string;
    puntoLlegadaDireccion: string;
}
