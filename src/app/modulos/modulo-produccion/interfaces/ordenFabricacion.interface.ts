export interface IOrdenFabricacionBySede {
  idProducion: number;
  itemCode: string;
  itemName: string;
  codeBar: string;
  cantidadPlanificada: string;
  unidadMedida: string;
  bultoProcesado: number;
  pesoProcesado: number;
  fecha: Date;
  maquina: string;
}

export interface IOrdenFabricacionGeneralBySede {
  fechaOrdenFabricacion: Date;
  fechaFin: Date;
  fechaSistema: Date;
  tipo: string;
  estado: string;
  docNum: number;
  itemProd: string;
  dscItemProd: string;
  almacen: string;
  unidadMedida: string;
  qProd: number;
  pesoProd: number;
  sede: string;
}
