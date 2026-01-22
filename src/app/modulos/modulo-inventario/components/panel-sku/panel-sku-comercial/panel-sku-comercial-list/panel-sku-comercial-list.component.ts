import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { LayoutComponent } from 'src/app/layout/layout.component';
import { UtilService } from 'src/app/services/util.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { OSKCService } from 'src/app/modulos/modulo-inventario/services/oskc.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';
import { IOSKC } from 'src/app/modulos/modulo-inventario/interfaces/oskc.interface';
import { OSKCFindByDateModel } from 'src/app/modulos/modulo-inventario/models/oskc.model';
import { DatePipe } from '@angular/common';
import { saveAs } from 'file-saver';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-inv-panel-sku-comercial-list',
  templateUrl: './panel-sku-comercial-list.component.html',
  styleUrls: ['./panel-sku-comercial-list.component.css']
})
export class PanelSkuComercialListComponent implements OnInit {
  modeloForm: FormGroup;
  // Titulo del componente
  titulo            = 'SKU comercial';
  // Acceso de botones
  buttonAcces       : ButtonAcces = new ButtonAcces();
  // Name de los botones de accion
  globalConstants   : GlobalsConstantsForm = new GlobalsConstantsForm();
  // MODAL: Progreso
  isDisplay         : boolean = false;
  isDeleting        : boolean = false;

  opciones          : any = [];
  oskcList          : IOSKC[] = [];
  modeloSelected    : IOSKC;
  params            : OSKCFindByDateModel = new OSKCFindByDateModel();

  constructor
  (
    private router                          : Router,
    private datePipe                        : DatePipe,
    private fb                              : FormBuilder,
    public app                              : LayoutComponent,
    public readonly utilService             : UtilService,
    private readonly swaCustomService       : SwaCustomService,
    private readonly accesoOpcionesService  : AccesoOpcionesService,
    private oSKCService                     : OSKCService
  ) {}

  ngOnInit() {
    this.onBuildForm();
    this.opcionesTabla();
    this.getList();
  }

  onBuildForm() {
    this.modeloForm = this.fb.group({
      strDate: [new Date(), Validators.required],
      endDate: [new Date(), Validators.required],
    });
    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-inv-panel-sku-comercial-list');
  }

  opcionesTabla() {
    this.opciones =
    [
      { label: 'Editar',  icon: 'pi pi-pencil', command: () => { this.onClickEditar(); }},
      { label: 'Eliminar',icon: 'pi pi-trash',  command: () => { this.onClickElminar(); }
      },
    ];
  }

  onSelectedItem(modelo: any) {
    this.modeloSelected = modelo;
  }

  onClickBuscar() {
    this.getList();
  }

  getList() {
    this.isDisplay = true;
    this.params = this.modeloForm.getRawValue();
    this.oSKCService.getListByDateRange(this.params).pipe(
      finalize(() => { this.isDisplay = false; })
    ).subscribe({
      next: (data: IOSKC[]) => {
        this.oskcList = data;
      },
      error: (e) => {
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onClickCreate() {
    this.router.navigate(['/main/modulo-inv/panel-sku-comercial-create']);
  }

  onToExcel() {
    this.isDisplay = true;
    this.params = this.modeloForm.getRawValue();
    this.oSKCService.getOSKCExcel(this.params).pipe(
      finalize(() => { this.isDisplay = false; })
    ).subscribe({
      next: (response: any) => {
        const fechaActual = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
        const nombreArchivo = `SKU comercial - ${fechaActual}.xlsx`;
        saveAs(
          new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
          nombreArchivo
        );
        this.swaCustomService.swaMsgExito(null);
      },
      error: (e: import('@angular/common/http').HttpErrorResponse) => {
        const defaultMessage = 'No se encontraron registros para generar el reporte';
        // El responseType es 'arraybuffer', por lo que el error viene en un ArrayBuffer.
        if (e.error instanceof ArrayBuffer) {
          try {
            // Decodificar el ArrayBuffer a un string
            const errorString = new TextDecoder('utf-8').decode(e.error);
            const errorData = JSON.parse(errorString);
            this.swaCustomService.swaMsgError(errorData.resultadoDescripcion || defaultMessage);
          } catch (err) {
            this.swaCustomService.swaMsgError(defaultMessage);
          }
        } else {
          this.swaCustomService.swaMsgError(e.error?.resultadoDescripcion || defaultMessage);
        }
      }
    });
  }

  onClickEditar() {
    this.router.navigate(['/main/modulo-inv/panel-sku-comercial-update', this.modeloSelected.u_Number]);
  }

  eliminar() {
    this.isDeleting = true;
    const params: any = { code: this.modeloSelected.code };
    this.oSKCService.setDelete(params).pipe(
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

  onClickElminar() {
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

  onClickVisualizar() {
    // Visualizar logic here
  }
}
