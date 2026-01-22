
export interface IFacturaVentaSap {
  docEntry: number;
  docNum: number;
  serie: string;
  numero: string;
  docDueDate: Date;
  taxDate: Date;
  cardCode: string;
  licTradNum: string;
  cardName: string;

  ventaResumen1: IVentaResumenSapByFechaGrupo[];
  ventaResumen2: IVentaResumenSapByFechaGrupo[];
  ventaResumen3: IVentaResumenSapByFechaGrupo[];
}


export interface IVentaByFecha {
  cardCode: string;
  CardName: string;
  unidadNegocio: string;
  sector: string;
  division: string;
  pais: string;
  tipoDocumento: string;
  fecContabilizacion: Date;
  numeroDocumento: string;
  numeroGuia: string;
  numeroPedido: number;
  fechaPedido?: Date;
  nomEmpleado: string;
  nomCondicionPago: string;
  itemCode: string;
  itemName: string;
  cantidad: number;
  precio: number;
  codMoneda: string;
  totalItemSOL: number;
  totalItemUSD: number;
}


export interface IVentaResumenSapByFechaGrupo {
  nomVendedor: string;
  nomGrupo: string;
  itemName: string;
  unidadMedida: string;
  cantidad: number;
  totalItemUSD: number;
}

export interface IVentaProyeccionByFecha {
  slpCode: number;
  slpName: string;

  ventaMesAnioAnterior: number;
  cuotaMesAnioAnterior: number;
  variacionMesAnioAnterior: number;
  avanceMesAnioAnterior: number;

  ventaAnioAnterior: number;
  cuotaAnioAnterior: number;
  variacionAnioAnterior: number;
  avanceAnioAnterior: number;

  ventaMesAnterior: number;
  cuotaMesAnterior: number;
  variacionMesAnterior: number;
  avanceMesAnterior: number;

  ventaMesActual: number;
  cuotaMesActual: number;
  variacionMesActual: number;
  avanceMesActual: number;

  ventaAnioActual: number;
  cuotaAnioActual: number;
  variacionAnioActual: number;
  avanceAnioActual: number;
}


export interface IVentaByFecha {
  unidadNegocio: string;
  cardCode: string;
  cardName: string;

  tipoDocumento: string;
  fecContabilizacion: Date;
  numeroDocumento: string;
  numeroGuia: string;
  numeroPedido: number;
  nomVendedor: string;

  itemCode: string;
  itemName: string;
  nomGrupo: string;

  unidadMedida: string;
  cantidad: number;
  pesoItem: number;
  pesoPromedioKg: number;
  peso: number;

  rolloVendido: number;
  kgVendido: number;
  toneladaVendida: number;

  codMoneda: string;
  tipoCambio: number;
  precio: number;
  precioKg: number;
  costoSOL: number;
  costoUSD: number;

  totalCostoItemSOL: number;
  totalCostoItemUSD: number;

  totalItemSOL: number;
  totalItemUSD: number;
}


export interface IFacturaVentaByFecha {
  CardName: string;
  fecContabilizacion: Date;
  fecVencimiento: Date;
  diaVencido: number;
  numeroDocumento: string;
  nomVendedor: string;
  codMoneda: string;
  total: number;
  cobrado: number;
  saldo: number;
}
