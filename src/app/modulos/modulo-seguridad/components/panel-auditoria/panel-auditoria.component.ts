import { Component, OnInit } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { Subscription } from 'rxjs';
import { SeguridadService } from '../../services/seguridad.service';
import { ButtonAcces } from 'src/app/models/acceso-button.model';

@Component({
  selector: 'app-seg-panel-auditoria',
  templateUrl: './panel-auditoria.component.html',
  styleUrls: ['./panel-auditoria.component.css']
})
export class PanelAuditoriaComponent implements OnInit {
// Titulo del componente
  titulo = 'Auditoria';
  // Acceso de botones
  buttonAcces: ButtonAcces = new ButtonAcces();
  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  // Opcion Buscar
  descripcionId = '';
  descripcionTabla = '';
  descripcionCampo = '';
  modeloFind: any;
  listModelo: any[];

  columnas: any[];

  subscription: Subscription;

  constructor(private seguridadService: SeguridadService
    ) {}

    ngOnInit() {
      this.columnas = [
        { header: 'Correlativo' },
        { header: 'Id' },
        { header: 'Usuario' },
        { header: 'Tabla' },
        { header: 'Campo' },
        { header: 'FecHora' },
        { header: 'Accion' },
        { header: 'ValorAntiguo' },
        { header: 'ValorNuevo' }
      ];
      this.onListar();
    }

    onToBuscar() {
      this.onListar();
    }

    onListar() {

      this.modeloFind = {idTransaccional: this.descripcionId, tabla: this.descripcionId, campo: this.descripcionCampo};
      this.subscription = new Subscription();
      this.subscription = this.seguridadService.getAuditoriaPorFiltro(this.modeloFind )
      .subscribe((resp: any[]) => {
        if (resp) {
            this.listModelo = resp;
          }
        },
        (error) => {
          // this.mensajePrimeNgService.onToErrorMsg(null, error);
        }
      );
    }
}
