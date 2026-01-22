export interface IKardex {
  tracNum: number;
}

export interface IKardexSaldoInicialByPeriodoArticulo {
  fecSaldoInicial: Date;
  itemCode: string;
  itemName: string;
  whsCode: string;
  cuenta: string;
  cantidadTotalSaldoFinal: number;
  costoTotalSaldoFinal: number;
  costoUnitario: number;
}
