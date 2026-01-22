export class OrdenMantenimientoWebFindByFechaAndIdEstadoModel {
  fecInicial: Date;
  fecFinal: Date;
  idEstado: string;
  numero: string;

  constructor(){
      this.fecInicial = null;
      this.fecFinal = null;
      this.idEstado = '';
      this.numero = '';
  }
}
