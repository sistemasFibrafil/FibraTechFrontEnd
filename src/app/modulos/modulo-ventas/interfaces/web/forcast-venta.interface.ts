export interface IForcastVenta {
  idForcastVenta: number;
  idConSinOc: number;
  nomConSinOc: string;
  idNegocio: number;
  nomNegocio: string;
  itmsGrpCod: number;
  itmsGrpNam: string;
  itemCode: string;
  docNum: number;
  cardCode: string;
  fecRegistro: string;
  unidadMedida: string;
  cantidad: number;
  kg: number;
  precio: number;
  codEstado: string;
  nomEstado: string;
  idUsuario: number;
}

export interface IForcastVentaByFecha {
  idForcastVenta: number;
  nomConSinOc: string;
  nomNegocio: string;
  itmsGrpNam: string;
  itemName: string;
  docNum: number;
  cardName: string;
  fecRegistro: Date;
  unidadMedida: string;
  cantidad: number;
  kg: number;
  precio: number;
  nomEstado: string;
}

export interface IForcastVentaConSinOc {
  idConSinOc: number;
  nomConSinOc: string;
}

export interface IForcastVentaNegocio {
  idNegocio: number;
  nomNegocio: string;
}

export interface IForcastVentaEstado {
  codEstado: string;
  nomEstado: string;
}

