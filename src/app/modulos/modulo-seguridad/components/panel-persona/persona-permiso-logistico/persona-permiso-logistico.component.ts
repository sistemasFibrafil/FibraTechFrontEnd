import { SelectItem } from 'primeng/api';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { LayoutComponent } from '../../../../../layout/layout.component';
import { Subject, Subscription, finalize, forkJoin, takeUntil } from 'rxjs';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from '../../../../../constants/globals-constants-form';

import { PerfilModel } from '../../../models/pefil.model';
import { LogisticUserModel } from '../../../models/logistic-user.model';

import { MenuItem, TableColumn } from 'src/app/interface/common-ui.interface';

import { UtilService } from '../../../../../services/util.service';
import { SwaCustomService } from '../../../../../services/swa-custom.service';
import { LogisticUserService } from '../../../services/logistic-user.service';
import { LocationService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/inventario/location.service';
import { WarehousesService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/inventario/warehouses.service';
import { CamposDefinidoUsuarioService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/user-defined-fields.service';


@Component({
  selector: 'app-seg-persona-permiso-logistico',
  templateUrl: './persona-permiso-logistico.component.html',
  styleUrls: ['./persona-permiso-logistico.component.css']
})
export class PersonaPermisoLogisticoComponent implements OnInit, OnDestroy {
  // Lifecycle management
    private readonly destroy$                   = new Subject<void>();
  modeloForm                                    : FormGroup;
  // Titulo del componente
  titulo                                        = 'Permiso logístico';
  // Name de los botones de accion
  buttonAcces                                   : ButtonAcces = new ButtonAcces();
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();
  idLogisticUser                                : number = 0;
  idUsuario                                     : number = 0;
  modelo                                        : any;
  modeloLines                                   : any[] = [];
  modeloLinesSelected                           : any;
  modeloPerfil                                  : PerfilModel = new PerfilModel();
  // UI State
  isSaving                                      = false;
  isDisplay                                     = false;
  // Table configuration
  columnas                                      : TableColumn[];
  opciones                                      : MenuItem[];
  objectTypeList                                 : SelectItem[] = [];
  warehouseList                                 : SelectItem[] = [];
  locationList                                  : SelectItem[] = [];
  subscription                                  : Subscription;


  constructor
  (
    private fb: FormBuilder,
    private router: Router,
    public app: LayoutComponent,
    private utilService: UtilService,
    private readonly route: ActivatedRoute,
    private locationService: LocationService,
    private warehouseService: WarehousesService,
    private readonly swaCustomService: SwaCustomService,
    private readonly logisticUserService: LogisticUserService,
    private readonly camposDefinidoUsuarioService: CamposDefinidoUsuarioService
  ) {}

  ngOnInit() {
    this.onBuildForm();
    this.onBuildColumn();
    this.opcionesTabla();
    this.onInicializar();
    // Cargar combos primero y luego obtener la persona por id
    this.route.params.subscribe((params: Params) => {
      this.idUsuario = params['id'];
      this.loadCombosAndThenPerson();
    });
  }

  onInicializar() {

  }

  private onBuildColumn(): void {
    this.columnas = [
      { field: 'objectType',      header: 'Tipo de operación' },
      { field: 'whsCode',         header: 'Almacén' },
      { field: 'toWhsCode',       header: 'Almacén destino' },
      { field: 'blocked',         header: 'Bloqueado' },
    ];
  }

  onBuildForm() {
    this.modeloForm = this.fb.group(
      {
        'apellidoPaterno' : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required, Validators.maxLength(50), Validators.minLength(2)])),
        'apellidoMaterno' : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required, Validators.maxLength(50), Validators.minLength(2)])),
        'nombre'          : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required, Validators.maxLength(50), Validators.minLength(2)])),
        'location'        : new FormControl({ value: '', disabled: false }, Validators.compose([Validators.required, Validators.maxLength(50), Validators.minLength(2)])),
        'superUser'       : new FormControl({value: false, disabled: false}),
        'blocked'         : new FormControl({value: false, disabled: false}),
      }
    );
  }

  private opcionesTabla(): void {
    this.opciones = [
      { value: '1', label: 'Añadir línea', icon: 'pi pi-pencil',  command: () => this.onClickAddLine() },
      { value: '2', label: 'Borrar línea', icon: 'pi pi-times',   command: () => this.onClickDelete() },
    ];
  }

  private addLine(index: number): void {
    this.modeloLines.splice(index, 0, { objectType: '', whsCode: '', toWhsCode: '', blocked: false });
  }

  onClickAddLine(): void {
    if (!this.validateSelection()) return;
    const index = this.modeloLines.indexOf(this.modeloLinesSelected);
    const insertIndex = index + 1;
    this.addLine(insertIndex);
  }

  onClickDelete(): void {
    if (!this.validateSelection()) return;
    const index = this.modeloLines.indexOf(this.modeloLinesSelected);
    if (index > -1) {
      this.modeloLines.splice(index, 1);
    }

    if (this.modeloLines.length === 0) {
      this.addLine(0);
    }
  }

  onSelectedItem(modelo: any): void {
    this.modeloLinesSelected = modelo;
  }

  /**
   * Carga los combos necesarios en paralelo y luego obtiene la persona por id.
   * Esto garantiza que los dropdowns estén poblados antes de asignar valores
   * que dependen de ellos.
   */
  private loadCombosAndThenPerson(): void {
    const paramObjectType: any = { tableID: '@FIB_PRN1', aliasID: 'ObjectType' };
    const params: any = { inactive: 'N' };

    this.isDisplay = true;

    forkJoin({
      location: this.locationService.getList(),
      objectType: this.camposDefinidoUsuarioService.getList(paramObjectType),
      warehouses: this.warehouseService.getListByInactive(params)
    }).subscribe({
      next: (result: any) => {
        // objectType
        this.locationList = [];
        if (result.location && Array.isArray(result.location)) {
          for (const item of result.location) {
            this.locationList.push({ label: item.location, value: item.code });
          }
        }

        // objectType
        this.objectTypeList = [];
        if (result.objectType && Array.isArray(result.objectType)) {
          for (const item of result.objectType) {
            this.objectTypeList.push({ label: item.descr, value: item.fldValue });
          }
        }

        // warehouses
        this.warehouseList = [];
        if (result.warehouses && Array.isArray(result.warehouses)) {
          for (const item of result.warehouses) {
            this.warehouseList.push({ label: item.fullDescr, value: item.whsCode });
          }
        }

        // Finalmente, cuando los combos estén cargados, obtener la persona
        this.getToObtienePersonaPorId();

        this.isDisplay = false;
      },
      error: (e) => {
        const msg = e?.error?.resultadoDescripcion || 'Error al cargar combos';
        this.swaCustomService.swaMsgError(msg);
        // Intentar igualmente obtener la persona para no bloquear la pantalla
        this.getToObtienePersonaPorId();
        this.isDisplay = false;
      }
    });
  }

  getObjectTypeLabel(value: any): string {
    if (!Array.isArray(this.objectTypeList) || this.objectTypeList.length === 0) {
      return '';
    }

    const item = this.objectTypeList.find(x => x.value === value);
    return item ? item.label : '';
  }

  getToObtienePersonaPorId() {
    this.modeloLines = [];
    this.subscription = new Subscription();
    this.subscription = this.logisticUserService.getById(this.idUsuario)
    .subscribe(data => {
      this.modelo = data;
      this.idLogisticUser = data.idLogisticUser ?? 0;
      this.idUsuario      = data.idUsuario ?? 0;
      this.modeloForm.controls['apellidoPaterno'].setValue(this.modelo.apellidoPaterno);
      this.modeloForm.controls['apellidoMaterno'].setValue(this.modelo.apellidoMaterno);
      this.modeloForm.controls['nombre'].setValue(this.modelo.nombre);

      const location = this.locationList?.find(s => String(s.value) === String(this.modelo.idLocation));
      if (location) {
        this.modeloForm.controls['location'].setValue(location);
      }

      this.modeloForm.controls['superUser'].setValue(this.modelo.superUser);
      this.modeloForm.controls['blocked'].setValue(this.modelo.blocked);

      if(data.permissions==null || data.permissions.length==0) {
        this.addLine(0);
      }
      else {
        this.modeloLines = data.permissions;
      }
    });
  }

  private validateSave(): boolean {
    const showError = (message: string): boolean => {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo(message);
      return false;
    };

    const { location } = this.modeloForm.getRawValue();
    const locationValue = location?.value || location;

    if (!locationValue) {
      return showError('Seleccione la localización.');
    }

    return true;
  }

  onClickSave() {
    this.isSaving = true;

    if (!this.validateSave()) {
      return;
    }

    const formValues = {
      ...this.modeloForm.getRawValue()
    };

    const modeloToSave: any = {
      ... new LogisticUserModel(),
      idLogisticUser  : this.idLogisticUser,
      idUsuario       : this.idUsuario,
      idLocation      : formValues.location?.value || null,
      apellidoPaterno : formValues.apellidoPaterno,
      apellidoMaterno : formValues.apellidoMaterno,
      nombre          : formValues.nombre,
      superUser       : formValues.superUser,
      blocked         : formValues.blocked,
      permissions     : this.modeloLines
        .filter(line => line?.objectType !== undefined && line?.objectType !== null && line?.objectType !== '')
        .map(({ transtype, ...rest }) => ({ ...rest })),
    };

    this.logisticUserService.setCreate(modeloToSave)
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.isSaving = false; })
    )
    .subscribe({
      next: () => {
        this.swaCustomService.swaMsgExito(null);
        this.getToObtienePersonaPorId();
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'save', this.swaCustomService);
      }
    });
  }

  back() {
    this.router.navigate(['/main/modulo-seg/panel-persona']);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // ===========================
    // Helper Methods
    // ===========================

    private validateSelection(): boolean {
      if (!this.modeloLinesSelected) {
        this.swaCustomService.swaMsgInfo('Debe seleccionar al menos un registro');
        return false;
      }
      return true;
    }
}
