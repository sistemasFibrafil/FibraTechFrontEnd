export interface IOrdenMantenimientoWeb {
  idOrdenMantenimiento: number;
  fecInicio: Date;
  fecFin: Date;
  horaInicio: string;
  horaFin: string;
  nomTipoServicio: string;
  nomArea: string;
  nomMaquina: string;
  nomTecnico: string;
  codEstado: string;
}
