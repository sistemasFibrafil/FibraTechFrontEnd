export interface IAutenticarRequest {
    usuario: string;
    clave: string;
}

export interface IAutenticarResponse {
    usuario: string;
    valido: boolean;
    observacion: string;
}

export interface IRecuperarPasswordRequest {
    usuario: string;
    sociedad: string;
}

export interface IUsuarioToken {
    usuario: string;
    token: string;
}