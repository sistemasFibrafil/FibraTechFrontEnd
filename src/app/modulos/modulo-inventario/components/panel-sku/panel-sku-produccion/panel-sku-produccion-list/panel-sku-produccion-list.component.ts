import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';
import { OSKPService } from 'src/app/modulos/modulo-inventario/services/oskp.service';
import { IOSKP } from 'src/app/modulos/modulo-inventario/interfaces/oskp.interface';
import { OSKPFindByFiltroModel } from 'src/app/modulos/modulo-inventario/models/oskp.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-inv-panel-sku-produccion-list',
  templateUrl: './panel-sku-produccion-list.component.html',
  styleUrls: ['./panel-sku-produccion-list.component.css']
})
export class PanelSkuProduccionListComponent implements OnInit {
  modeloForm: FormGroup;
  // Titulo del componente
  titulo                  = 'SKU producción';
  // Acceso de botones
  buttonAcces             : ButtonAcces = new ButtonAcces();
  // Name de los botones de accion
  globalConstants         : GlobalsConstantsForm = new GlobalsConstantsForm();
  // Indicadores de carga
  isDisplay               : boolean = false;
  isDeleting              : boolean = false;

  columnas                : any[];
  opciones                : any[];

  modeloSelected          : IOSKP;
  list                    : IOSKP[] = [];
  params                  : OSKPFindByFiltroModel = new OSKPFindByFiltroModel();

  constructor
  (
    private router: Router,
    private fb: FormBuilder,
    private readonly swaCustomService: SwaCustomService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private oSKPService: OSKPService,
  ) {}

  ngOnInit() {
    this.onBuildForm();
    this.onBuildColumn();
    this.opcionesTabla();
    this.getList();
  }

  onBuildForm() {
    this.modeloForm = this.fb.group({
      filtro: [''],
    });
    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-inv-panel-sku-produccion-list');
  }

  onBuildColumn() {
    this.columnas = [
      { field: 'u_Number',          header: 'Número' },
      { field: 'u_ItemCode',        header: 'Código de artículo' },
      { field: 'u_ItemName',        header: 'Descripción de artículo' },
      { field: 'u_CardCode',        header: 'Código del cleinte' },
      { field: 'u_CardName',        header: 'Nombre del cleinte' },
    ];
  }

  opcionesTabla() {
    this.opciones = [
      { label: 'Editar',      icon: 'pi pi-pencil', command: () => { this.onClickEditar(); } },
      { label: 'Eliminar',    icon: 'pi pi-trash',  command: () => { this.onClickEliminar(); } },
    ];
  }

  onSelectedItem(modelo: IOSKP) {
    this.modeloSelected = modelo;
  }

  getList() {
    this.isDisplay = true;
    this.params = this.modeloForm.getRawValue();
    this.oSKPService.getListByFiltro(this.params).pipe(
      finalize(() => { this.isDisplay = false; })
    ).subscribe({
      next: (data: IOSKP[]) => {
        this.list = data;
      },
      error: (e) => {
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onClickBuscar() {
    this.getList();
  }

  onClickCreate() {
    this.router.navigate(['/main/modulo-inv/panel-sku-produccion-create']);
  }

  onClickEditar() {
    this.router.navigate(['/main/modulo-inv/panel-sku-produccion-update', this.modeloSelected.docEntry]);
  }

  eliminar() {
    this.isDeleting = true;
    const params: any = { docEntry: this.modeloSelected.docEntry };
    this.oSKPService.setDelete(params).pipe(
      finalize(() => { this.isDeleting = false; })
    ).subscribe({
      next: () => {
        this.getList();
        this.swaCustomService.swaMsgExito(null);
      },
      error: (e) => {
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onClickEliminar() {
    this.swaCustomService.swaConfirmation(
      this.globalConstants.titleEliminar,
      this.globalConstants.subTitleEliminar,
      this.globalConstants.icoSwalQuestion
    ).then((result) => {
      if (result.isConfirmed) {
        this.eliminar();
      }
    });
  }
}
