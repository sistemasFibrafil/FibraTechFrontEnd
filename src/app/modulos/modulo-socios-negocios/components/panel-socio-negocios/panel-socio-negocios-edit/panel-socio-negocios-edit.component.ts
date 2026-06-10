import { switchMap } from 'rxjs/operators';
import { SelectItem, MenuItem } from 'primeng/api';
import { FormGroup, FormBuilder} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { finalize, forkJoin, Subject, takeUntil } from 'rxjs';

import { GlobalsConstantsForm } from '@app/constants/globals-constants-form';

import { SocioNegocioUpdateModel } from '@app/modulos/modulo-socios-negocios/models/socio-negocio.model';

import { TableColumn } from '@app/interface/common-ui.interface';
import { IUbigeo } from '@app/modulos/modulo-socios-negocios/interfaces/ubigeo.interface';
import { IAddresses } from '@app/modulos/modulo-socios-negocios/interfaces/addresses.interface';
import { IContactEmployees } from '@app/modulos/modulo-socios-negocios/interfaces/contact-employees.interface';
import { IBusinessPartnersQuery } from '@app/modulos/modulo-socios-negocios/interfaces/business-partners.interface';

import { UtilService } from '@app/services/util.service';
import { SwaCustomService } from '@app/services/swa-custom.service';
import { LocalDataService } from '@app/services/local-data.service';
import { UserContextService } from '@app/services/user-context.service';
import { BusinessPartnersService } from '@app/modulos/modulo-socios-negocios/services/business-partners.service';
import { StatesService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/socio-negocios/states.service';
import { TaxGroupsService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/finanzas/tax-groups.service';
import { SalesPersonsService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/sales-persons.service';
import { CurrencyCodesService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/finanzas/currency-codes.service';
import { UserDefinedFieldsService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/user-defined-fields.service';
import { PaymentTermsTypesService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/socio-negocios/payment-terms-types.service';
import { BusinessPartnerGroupsService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/socio-negocios/business-partner-groups.service';
import { BusinessPartnerSectorsService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/socio-negocios/business-partner-sectors.service';
import { BusinessPartnerDivisionsService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/socio-negocios/business-partner-divisions.service';
import { BusinessPartnerGroupsUserTableService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/socio-negocios/business-partner-groups-user-table.service';


@Component({
  selector: 'app-soc-panel-socio-negocios-edit',
  templateUrl: './panel-socio-negocios-edit.component.html',
  styleUrls: ['./panel-socio-negocios-edit.component.css']
})
export class PanelSocioNegociosEditComponent implements OnInit, OnDestroy {
  // ===========================
  // 🔹 1. LIFECYCLE / CORE
  // ===========================
  private readonly destroy$             = new Subject<void>();
  private readonly h                    = this.utilService.getHelpers();


  // ===========================
  // 🔹 2. CONFIG / CONSTANTS
  // ===========================
  globalConstants                       : GlobalsConstantsForm = new GlobalsConstantsForm();


  // ===========================
  // 🔹 3. FORMS
  // ===========================
  modeloForm                            : FormGroup;


  // ===========================
  // 🔹 4. UI STATE
  // ===========================
  isSaving                              : boolean = false;
  isDisplay                             : boolean = false;
  hasRealChanges                        : boolean = false;
  isVisualizarUbigeo                    : boolean = false;
  isLoadingInitialData                  : boolean = false;


  // ===========================
  // 🔹 5. TABLE CONFIG
  // ===========================
  private initialSnapshot!              : any;

  opcionesAddress                       : MenuItem[];
  opcionesContactEmployees              : MenuItem[];

  columnsAddress                        : TableColumn[] = [];
  columnsContactEmployees               : TableColumn[] = [];


  // ===========================
  // 🔹 6. DATA (CORE)
  // ===========================
  modeloAddressLinesSelected            : IAddresses;
  modeloContactEmployeesLinesSelected   : IContactEmployees;

  modeloAddressLines                    : IAddresses[] = [];
  modeloContactEmployeesLines           : IContactEmployees[] = [];


  // ===========================
  // 🔹 7. COMBOS / LISTS
  // ===========================
  stateList                             : SelectItem[] = [];
  groupsList                            : SelectItem[] = [];
  countryList                           : SelectItem[] = [];
  cardTypeList                          : SelectItem[] = [];
  sectorsList                           : SelectItem[] = [];
  carrierList                           : SelectItem[] = [];
  taxGroupsList                         : SelectItem[] = [];
  divisionsList                         : SelectItem[] = [];
  priceListsList                        : SelectItem[] = [];
  personTypeList                        : SelectItem[] = [];
  addressTypeList                       : SelectItem[] = [];
  salesPersonsList                      : SelectItem[] = [];
  currencyCodesList                     : SelectItem[] = [];
  paymentTermsTypesList                 : SelectItem[] = [];
  identityDocumentTypeList              : SelectItem[] = [];


  // ===========================
  // 🔹 8. INDEXES (UI CONTROL)
  // ===========================
  indexUbigeo                           : number = 0;


  // ===========================
  // 🔹 10. TEXT / AUX / FILTERS
  // ===========================
  titulo                                : string = 'Socio de Negocio';
  prefijo                               : string = '';
  cardCode                              : string = '';


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly statesService: StatesService,
    private readonly swaCustomService: SwaCustomService,
    private readonly taxGroupsService: TaxGroupsService,
    private readonly localDataService: LocalDataService,
    private readonly salesPersonsService: SalesPersonsService,
    private readonly CurrencyCodesService: CurrencyCodesService,
    private readonly businessPartnersService: BusinessPartnersService,
    private readonly paymentTermsTypesService: PaymentTermsTypesService,
    private readonly businessPartnerGroupsService: BusinessPartnerGroupsService,
    private readonly userDefinedFieldsService: UserDefinedFieldsService,
    private readonly businessPartnerSectorsService: BusinessPartnerSectorsService,
    private readonly businessPartnerDivisionsService: BusinessPartnerDivisionsService,
    private readonly businessPartnerGroupsUserTableService: BusinessPartnerGroupsUserTableService,
    public  readonly utilService: UtilService,
  ) {}



  //#region <<< 1. LIFECYCLE >>>

  ngOnInit() {
    this.initializeComponent();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //#endregion



  //#region <<< 2. INITIALIZATION >>>

  private initializeComponent(): void {
    // 1️⃣ Crear formularios
    this.onBuildForm();

    // 2️⃣ Cargar datos base
    this.loadAllCombos();

    // 3️⃣ Registrar listeners reactivos
    this.wireGroupsControl();
    this.wireNaturalPersonNameControl();
    this.wireBusinessPartnerGroupsControl();
    this.wireCardCodeGenerationControl();

    // 4️⃣ Inicializar UI
    this.buildColumnsAddress();
    this.buildColumnsContactEmployees();
    this.buildContactAddressTableOptions();
    this.buildContactContactEmployeesTableOptions();

    // 5️⃣ Inicializar líneas
    this.onAddAddress(0);
    this.onAddContact(0);
  }

  private onBuildForm(): void {
    const r = (value: number, dec: number) => this.utilService.onRedondearDecimalConCero(value, dec);

    const fc = this.utilService.fc.bind(this.utilService);

    this.modeloForm = this.fb.group({
      cardCode              : fc('', true),
      cardName              : fc('', true),
      cardType              : fc('C', true),
      licTradNum            : fc('', true),
      groups                : fc('', true),
      currencyCodes         : fc('', true),

      personType            : fc('', true),
      identityDocumentType  : fc('', true),
      divisions             : fc('', true),
      sectors               : fc('', true),

      phone1                : fc(''),
      phone2                : fc(''),
      cellular              : fc('', true),
      email                 : fc(''),
      validFor              : fc('Y', true),
      salesPersons          : fc(null, true),
      notes                 : fc(''),

      paymentTermsTypes     : fc(null, true),
      priceList             : fc(null, true),
      creditLine            : fc(r(0, 2)),

      carrier               : fc('N', true),
      u_BPP_BPNO            : fc(''),
      u_BPP_BPAP            : fc(''),
      u_BPP_BPAM            : fc(''),
      u_FIB_Email2          : fc(''),
      u_FIB_Email3          : fc(''),
    });
  }

  private loadAllCombos(): void {
    const paramState                : any = { countryCode: 'PE' };
    const paramPersonType           : any = { tableID: 'OCRD', aliasID: 'BPP_BPTP' };
    const paramIdentityDocumentType : any = { tableID: 'OCRD', aliasID: 'BPP_BPTD' };

    this.isDisplay = true;

    const cardType: any = this.localDataService.cardType;
    this.cardTypeList = cardType.map(s => ({ label: s.name, value: s.code }));

    const carrier: any = this.localDataService.yesNoOptions;
    this.carrierList = carrier.map(s => ({ label: s.name, value: s.code }));

    const defaultCarrier = this.carrierList.find(x => x.value === 'N');

    if (defaultCarrier) {
      this.modeloForm.get('carrier').setValue(defaultCarrier, { emitEvent: false });
    }

    const addressType: any = this.localDataService.addressType;
    this.addressTypeList = addressType.map(s => ({ label: s.name, value: s.code }));

    forkJoin({
      states                : this.statesService.getListByCountryCode(paramState),
      sectors               : this.businessPartnerSectorsService.getList(),
      taxGroups             : this.taxGroupsService.getList(),
      countries             : this.businessPartnersService.getCountries(),
      divisions             : this.businessPartnerDivisionsService.getList(),
      priceLists            : this.businessPartnersService.getPriceLists(),
      personType            : this.userDefinedFieldsService.getList(paramPersonType),
      salesPersons          : this.salesPersonsService.getList(),
      currencyCodes         : this.CurrencyCodesService.getList(),
      paymentTermsTypes     : this.paymentTermsTypesService.getList(),
      identityDocumentType  : this.userDefinedFieldsService.getList(paramIdentityDocumentType),
    })
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isDisplay = false)
    )
    .subscribe({
      next: (res) => {
        this.currencyCodesList = [
          {
            label: 'Monedas (todas)',
            value: '##'
          },
          ...(res.currencyCodes ?? []).map(x => ({
            label: x.currName,
            value: x.currCode
          }))
        ];

        this.personTypeList = (res.personType ?? []).map(x => ({
          label: x.fullDescr,
          value: x.fldValue
        }));

        this.identityDocumentTypeList = (res.identityDocumentType ?? []).map(x => ({
          label: x.fullDescr,
          value: x.fldValue
        }));

        this.divisionsList = (res.divisions ?? []).map(x => ({
          label: x.name,
          value: x.code
        }));

        this.sectorsList = (res.sectors ?? []).map(x => ({
          label: x.name,
          value: x.code
        }));

        this.paymentTermsTypesList = (res.paymentTermsTypes ?? []).map(cp => ({
          label: cp.pymntGroup,
          value: cp.groupNum
        }));

        this.salesPersonsList = (res.salesPersons ?? []).map(v => ({
          label: v.slpName,
          value: v.slpCode
        }));

        this.countryList = (res.countries ?? []).map(p => ({
          label: p.name,
          value: p.code
        }));

        this.stateList = (res.states ?? []).map(x => ({
          label: x.name,
          value: x.code
        }));

        this.priceListsList = (res.priceLists ?? []).map(x => ({
          label: x.priceListName,
          value: x.priceListNo
        }));

        this.taxGroupsList = (res.taxGroups ?? []).map(x => ({
          label: `${x.code} - ${x.name}`,
          value: x.code
        }));

        this.loadBusinessPartnerGroupsUserTable();

        this.loadData();
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadAllCombos', this.swaCustomService);
      }
    });
  }

  private loadBusinessPartnerGroups(): void {
    const f = this.modeloForm.getRawValue();

    const paramGroupType = {
      groupType: this.h.p(this.h.v(f.cardType))
    };

    if (!paramGroupType.groupType) return;

    this.businessPartnerGroupsService.getListByGroupType(paramGroupType)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any[] = []) => {
        this.groupsList = (res ?? []).map(g => ({
          label: g.groupName,
          value: g.groupCode
        }));
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadBusinessPartnerGroups', this.swaCustomService);
      }
    });
  }

  private loadStates(countryCode: any): void {
    if (!countryCode) return;

    const params = { countryCode: countryCode };

    this.statesService.getListByCountryCode(params)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any[] = []) => {
        this.stateList = (res ?? []).map(p => ({
          label: p.name,
          value: p.code
        }));
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadStates', this.swaCustomService);
      }
    });
  }

  private loadBusinessPartnerGroupsUserTable(): void {
    const f = this.modeloForm.getRawValue();

    const params = { code: this.h.p(this.h.v(f.groups)) };

    if (!params.code) return;

    this.businessPartnerGroupsUserTableService.getByCode(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any = '') => {
          this.prefijo = this.h.p(res?.u_Prefix);
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'loadBusinessPartnerGroups', this.swaCustomService);
        }
      });
  }

  //#endregion



  //#region <<< 3. GETTERS >>>

  private get isValidFor(): boolean {
    return this.modeloForm.get('validFor')?.value === 'Y';
  }

  get validForLabel(): string {
    return this.isValidFor ? 'Activo' : 'Inactivo';
  }

  isShipToAddress(modelo: any): boolean {
    return (modelo?.adresType ?? modelo?.addressType) === 'S';
  }

  getAddresTypeText(code: string) {
    return this.addressTypeList.find(n => n.value === code);
  }

  get isNaturalPerson(): boolean {
    const f = this.modeloForm.getRawValue();
    const value = this.h.p(this.h.v(f.personType));

    return ['TPN', 'TPNE'].includes(value);
  }

  //#endregion



  //#region <<< 4. TABLE / CONTEXT MENU >>>

  private buildColumnsAddress(): void {
    this.columnsAddress = [
      { field: 'address',           header: 'ID de dirección' },
      { field: 'addressType',       header: 'Tipo' },
      { field: 'country',           header: 'País' },
      { field: 'glblLocNum',        header: 'Ubigeo' },
      { field: 'state',             header: 'Departamento' },
      { field: 'county',            header: 'Provincia' },
      { field: 'city',              header: 'Distrito' },
      { field: 'street',            header: 'Calle' },
      { field: 'taxCode',           header: 'Impuesto' }
    ];
  }

  private buildColumnsContactEmployees(): void {
    this.columnsContactEmployees = [
      { field: 'name',              header: 'ID de contacto' },
      { field: 'firstName',         header: 'Nombre' },
      { field: 'lastName',          header: 'Apellidos' },
      { field: 'e_MailL',           header: 'Email' }
    ];
  }

  private buildContactAddressTableOptions() {
    this.opcionesAddress = [
      { label: 'Añadir línea', icon: 'pi pi-plus', command: () => this.onClickAddAddress() },
      { label: 'Borrar línea', icon: 'pi pi-trash', command: () => this.onClickDeleteAddress() }
    ];
  }

  private buildContactContactEmployeesTableOptions() {
    this.opcionesContactEmployees = [
      { label: 'Añadir línea', icon: 'pi pi-plus', command: () => this.onClickAddContact() },
      { label: 'Borrar línea', icon: 'pi pi-trash', command: () => this.onClickDeleteContact() }
    ];
  }

  //#endregion



  //#region <<< 5. TABLE SELECTION / ACTIONS >>>

  onClickAddContact(): void {
    /** Agrega una nueva línea vacía después de la fila seleccionada */
    const index = this.modeloContactEmployeesLines.indexOf(this.modeloContactEmployeesLinesSelected);
    const insertIndex = index + 1;

    this.onAddContact(insertIndex);

    this.detectRealChanges();
  }

  private onClickDeleteContact(): void {
    const index = this.modeloContactEmployeesLines.indexOf(this.modeloContactEmployeesLinesSelected);
    if (index > -1) {
      this.modeloContactEmployeesLines.splice(index, 1);
    }

    if (this.modeloContactEmployeesLines.length === 0) {
      this.onAddContact(0);
    }

    this.detectRealChanges();
  }

  onSelectContacto(modelo: any): void {
    this.modeloContactEmployeesLinesSelected = modelo;
  }

  onClickSetStandardContact(): void {
    if (!this.modeloContactEmployeesLinesSelected) {
      this.swaCustomService.swaMsgInfo('Seleccione una persona de contacto.');
      return;
    }

    // Limpiar estándar anterior
    this.modeloContactEmployeesLines.forEach(x => {
      x.default = '';
    });

    // Asignar nuevo estándar
    this.modeloContactEmployeesLinesSelected.default = 'X';

    this.detectRealChanges();
  }

  onClickAddAddress(): void {
    /** Agrega una nueva línea vacía después de la fila seleccionada */
    const index = this.modeloAddressLines.indexOf(this.modeloAddressLinesSelected);
    const insertIndex = index + 1;

    this.onAddAddress(insertIndex);

    this.detectRealChanges();
  }

  private onClickDeleteAddress(): void {
    const index = this.modeloAddressLines.indexOf(this.modeloAddressLinesSelected);
    if (index > -1) {
      this.modeloAddressLines.splice(index, 1);
    }

    if (this.modeloAddressLines.length === 0) {
      this.onAddAddress(0);
    }

    this.detectRealChanges();
  }

  onSelectAddress(modelo: any) {
    this.modeloAddressLinesSelected = modelo;
  }

  onClickSetStandardAddress(): void {
    if (!this.modeloAddressLinesSelected) {
      this.swaCustomService.swaMsgInfo('Seleccione una dirección.');
      return;
    }

    const selectedType = this.modeloAddressLinesSelected.adresType;

    // Limpiar estándar solo del mismo tipo
    this.modeloAddressLines
      .filter(x => x.adresType === selectedType)
      .forEach(x => {
        x.default = '';
      });

    // Asignar estándar
    this.modeloAddressLinesSelected.default = 'X';

    this.detectRealChanges();
  }

  //#endregion



  //#region <<< 6. FORM EVENTS >>>

  private wireNaturalPersonNameControl(): void {
    ['u_BPP_BPNO', 'u_BPP_BPAP', 'u_BPP_BPAM'].forEach(field => {
      this.modeloForm.controls[field]?.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.updateCardNameForNaturalPerson());
    });
  }

  private updateCardNameForNaturalPerson(): void {
    const tipoPersona = this.modeloForm.controls['personType'].value;

    if (!['TPN', 'TPNE'].includes(tipoPersona)) return;

    const nombre = this.modeloForm.controls['u_BPP_BPNO'].value || '';
    const apPaterno = this.modeloForm.controls['u_BPP_BPAP'].value || '';
    const apMaterno = this.modeloForm.controls['u_BPP_BPAM'].value || '';

    const fullName = `${apPaterno} ${apMaterno} ${nombre}`.trim();

    this.modeloForm.controls['cardName'].setValue(fullName, { emitEvent: false });
  }

  private wireBusinessPartnerGroupsControl(): void {
    this.modeloForm.controls['cardType'].valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(value => {
      if (!value) return;

      this.loadBusinessPartnerGroups();
    });
  }

  private wireCardCodeGenerationControl(): void {
    this.modeloForm.controls['licTradNum'].valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      if (!this.isLoadingInitialData) {
        this.detectRealChanges();
      }
    });
  }

  private wireGroupsControl(): void {
    this.modeloForm.controls['groups'].valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(value => {
      if (!value) return;

      this.loadBusinessPartnerGroupsUserTable();
    });
  }

  //#endregion



  //#region <<< 7. LINES (CORE) >>>

  private onAddContact(index: number): void {
    const isFirstLine = this.modeloContactEmployeesLines.length === 0;

    const newLine: IContactEmployees = {
      cntctCode   : 0,
      name        : '',
      firstName   : '',
      lastName    : '',
      e_MailL     : '',
      default     : isFirstLine ? 'X' : '',
      record      : 1,
    };

    // 🔥 Crear nueva referencia
    this.modeloContactEmployeesLines = [
      ...this.modeloContactEmployeesLines.slice(0, index),
      newLine,
      ...this.modeloContactEmployeesLines.slice(index)
    ];
  }

  private onAddAddress(index: number): void {
    // 🔥 Validar si ya existe un estándar B
    const existsDefaultB = this.modeloAddressLines.some(x =>
      x.adresType === 'B' &&
      x.default === 'X'
    );

    // 🔥 Validar si ya existe un estándar S
    const existsDefaultS = this.modeloAddressLines.some(x =>
      x.adresType === 'S' &&
      x.default === 'X'
    );

    // 🔥 Si todavía no existe B estándar,
    // la nueva línea nace como B estándar.
    // Caso contrario nace como S estándar si aún no existe.
    let adresType: 'B' | 'S' = 'B';
    let defaultValue = '';

    if (!existsDefaultB) {
      adresType = 'B';
      defaultValue = 'X';
    }
    else if (!existsDefaultS) {
      adresType = 'S';
      defaultValue = 'X';
    }

    const newLine: IAddresses = {
      lineNum     : 0,
      address     : '',
      adresType   : adresType,
      country     : 'PE',
      glblLocNum  : '',
      state       : '',
      city        : '',
      county      : '',
      street      : '',
      taxCode     : '',
      default     : defaultValue,
      record      : 1
    };

    // 🔥 Crear nueva referencia
    this.modeloAddressLines = [
      ...this.modeloAddressLines.slice(0, index),
      newLine,
      ...this.modeloAddressLines.slice(index)
    ];
  }

  //#endregion



  //#region <<< 8. UBIGEO >>>

  onCountryChange(modelo: any): void {
    Object.assign(modelo, {
      state       : '',
      county      : '',
      city        : '',
      glblLocNum  : ''
    });

    if (modelo.country) {
      this.loadStates(modelo.country);
    }

    this.detectRealChanges();
  }

  onClickOpenUbigeo(index: number): void {
    this.indexUbigeo = index;
    this.isVisualizarUbigeo = !this.isVisualizarUbigeo;
  }

  onClickSelectedUbigeo(value: IUbigeo):void {
    const currentLine         = this.modeloAddressLines[this.indexUbigeo];
    currentLine.glblLocNum    = value.code;
    currentLine.state         = value.u_CodDepartamento;
    currentLine.county        = value.u_NomProvincia;
    currentLine.city          = value.u_NomDistrito;
    this.isVisualizarUbigeo   = !this.isVisualizarUbigeo;

    this.detectRealChanges();
  }

  onClickCloseUbigeo(): void {
    this.isVisualizarUbigeo = !this.isVisualizarUbigeo;
  }

  //#endregion



  //#region <<< 19. DATA LOADING >>>

  private loadData(): void {
    this.route.params
    .pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        this.cardCode = params['id'];

        // 🔥 aquí sí se activa de forma confiable
        this.isDisplay = true;

        return this.businessPartnersService
          .getByCode(this.cardCode)
          .pipe(
            finalize(() => {
              this.isDisplay = false;
            })
          );
      })
    )
    .subscribe({
      next: (data: IBusinessPartnersQuery) => {
        this.setFormValues(data);
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadData', this.swaCustomService);
      }
    });
  }

  private setFormValues(value: IBusinessPartnersQuery): void {
    console.log("VALUE :: ",value);
    this.isLoadingInitialData = true;

    this.setSocioForm(value);
    this.setGeneralForm(value);
    this.setContacto(value);
    this.setDireccion(value);
    this.setCondicionPagoForm(value);
    this.setOtrosForm(value);

    this.isLoadingInitialData = false;

    this.setInitialSnapshot();
    this.watchChanges();
    this.detectRealChanges();
  }

  private setSocioForm(value: IBusinessPartnersQuery): void {
    const cardTypeItem              = this.h.findItem(this.cardTypeList, value.cardType);

    this.groupsList = (value.groupsLines ?? []).map(x => ({
      label: x.groupName,
      value: x.groupCode
    }));

    const groupsItem                = this.h.findItem(this.groupsList, value.groupCode);
    const currencyItem              = this.h.findItem(this.currencyCodesList, value.currency);
    const personTypeItem            = this.h.findItem(this.personTypeList, value.u_BPP_BPTP);
    const identityDocumentTypeItem  = this.h.findItem(this.identityDocumentTypeList, value.u_BPP_BPTD);
    const divisionspeItem           = this.h.findItem(this.divisionsList, value.u_FIB_Divi);
    const sectorsItem               = this.h.findItem(this.sectorsList, value.u_FIB_Sector);

    this.h.patch(this.modeloForm, {
      cardCode              : this.h.p(value.cardCode),
      cardName              : this.h.p(value.cardName),
      cardType              : cardTypeItem,
      licTradNum            : this.h.p(value.licTradNum),
      groups                : groupsItem,
      currencyCodes         : currencyItem,

      personType            : personTypeItem,
      identityDocumentType  : identityDocumentTypeItem,
      divisions             : divisionspeItem,
      sectors               : sectorsItem,
    });
  }

  private setGeneralForm(value: IBusinessPartnersQuery): void {
    const salesPersonsItem = this.h.findItem(this.salesPersonsList, value.slpCode);

    this.h.patch(this.modeloForm, {
      phone1                : this.h.p(value.phone1),
      phone2                : this.h.p(value.phone2),
      cellular              : this.h.p(value.cellular),
      email                 : this.h.p(value.email),
      validFor              : this.h.p(value.validFor),
      salesPersons          : salesPersonsItem,
      notes                 : this.h.p(value.notes)
    });
  }

  private setContacto(value: IBusinessPartnersQuery): void {
    this.modeloContactEmployeesLines = (value.contactEmployeesLines || [])
      .map(linea => this.utilService.mapLine(linea));
  }

  private setDireccion(value: IBusinessPartnersQuery): void {
    this.modeloAddressLines = [
      ...(value.payAddressLines || []),
      ...(value.shipAddressLines || [])
    ].map(linea => this.utilService.mapLine(linea));
  }

  private setCondicionPagoForm(value: IBusinessPartnersQuery): void {
    const paymentTermsTypesItem     = this.h.findItem(this.paymentTermsTypesList, value.groupNum);
    const priceListsItem            = this.h.findItem(this.priceListsList, value.listNum);

    this.h.patch(this.modeloForm, {
      paymentTermsTypes     : paymentTermsTypesItem,
      creditLine            : this.h.r(value.creditLine, 2),
      priceList             : priceListsItem
    });
  }

  private setOtrosForm(value: IBusinessPartnersQuery): void {
    const carrierItem = this.h.findItem(this.carrierList, value.u_BPP_BPAT);

    this.h.patch(this.modeloForm, {
      carrier               : carrierItem,
      u_BPP_BPNO            : this.h.p(value.u_BPP_BPNO),
      u_BPP_BPAP            : this.h.p(value.u_BPP_BPAP),
      u_BPP_BPAM            : this.h.p(value.u_BPP_BPAM),
      u_FIB_Email2          : this.h.p(value.u_FIB_EMAIL2),
      u_FIB_Email3          : this.h.p(value.u_FIB_EMAIL3),
    });
  }

  //#endregion



  //#region <<< 9. SAVE >>>

  onClickSave(): void {
    this.confirmAndExecute(() => {
      this.executeCreateBusinessPartner();
    });
  }

  private confirmAndExecute(action: () => void): void {
    this.swaCustomService.swaConfirmation(
      this.globalConstants.titleGrabar,
      this.globalConstants.subTitleGrabar,
      this.globalConstants.icoSwalQuestion
    ).then(({ isConfirmed }) => {
      if (!isConfirmed) return;
      if (!this.validatedSave()) return;

      this.isSaving = true;
      action();
    });
  }

  private executeCreateBusinessPartner(): void {
    this.businessPartnersService
    .setUpdateBusinessPartner(this.buildModelToUpdate())
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isSaving = false)
    )
    .subscribe({
      next: () => {
        this.swaCustomService.swaMsgExito(null);
        this.back();
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'executeCreateBusinessPartner', this.swaCustomService);
      }
    });
  }

  private buildModelToUpdate(): SocioNegocioUpdateModel {
    const f = this.modeloForm.getRawValue();

    return {
      cardCode                : this.h.may(f.cardCode),
      cardName                : this.h.may(f.cardName),
      cardType                : this.h.p(this.h.v(f.cardType)),
      groupCode               : this.h.n(this.h.v(f.groups)),
      licTradNum              : this.h.p(f.licTradNum),
      currency                : this.h.p(this.h.v(f.currencyCodes)),

      u_BPP_BPTP              : this.h.p(this.h.v(f.personType)),
      u_BPP_BPTD              : this.h.p(this.h.v(f.identityDocumentType)),
      u_FIB_Divi              : this.h.p(this.h.v(f.divisions)),
      u_FIB_Sector            : this.h.p(this.h.v(f.sectors)),

      phone1                  : this.h.p(f.phone1),
      phone2                  : this.h.p(f.phone2),
      cellular                : this.h.p(f.cellular),
      email                   : this.h.p(f.email),
      validFor                : this.h.p(f.validFor),
      slpCode                 : this.h.n(this.h.v(f.salesPersons) ?? -1),
      notes                   : this.h.p(f.notes),

      cntctPrsn               : this.getDefaultContactName(),
      contactEmployeesLines   : this.mapLinesContactsUpdate(),

      addressesLines          : this.mapLinesAddressUpdate(),
      billToDef               : this.getDefaultAddressBillToDef(),
      address                 : this.getDefaultAddressBill(),
      shipToDef               : this.getDefaultAddressShipToDef(),
      mailAddres              : this.getDefaultAddressShip(),

      groupNum                : this.h.n(this.h.v(f.paymentTermsTypes)),
      listNum                 : this.h.n(this.h.v(f.priceList)),
      creditLine              : this.h.n(f.creditLine),
      debitLine               : this.h.n(f.creditLine),

      u_BPP_BPAT              : this.h.p(this.h.v(f.carrier)),
      u_BPP_BPNO              : this.h.may(f.u_BPP_BPNO),
      u_BPP_BPAP              : this.h.may(f.u_BPP_BPAP),
      u_BPP_BPAM              : this.h.may(f.u_BPP_BPAM),
      u_FIB_EMAIL2            : this.h.p(f.u_FIB_Email2),
      u_FIB_EMAIL3            : this.h.p(f.u_FIB_Email3)
    };
  }

  private validatedSave(): boolean {
    return (
      this.validateEmailByPrefix() &&
      this.validateContactEmployees() &&
      this.validateAddresses()
    );
  }

  private validateEmailByPrefix(): boolean {
    const prefijo = (this.prefijo ?? '').toUpperCase().trim();
    const email = this.utilService.normalizePrimitive(
      this.modeloForm.get('email')?.value
    );

    const emailRequired = ['C', 'CE'].includes(prefijo);

    if (emailRequired && !email) {
      this.swaCustomService.swaMsgInfo(
        'El email es obligatorio para clientes.'
      );
      return false;
    }

    return true;
  }

  private validateContactEmployees(): boolean {
    const contacts = this.modeloContactEmployeesLines ?? [];

    const rows = contacts.map(x => ({
      name: this.utilService.normalizePrimitive(x.name),
      firstName: this.utilService.normalizePrimitive(x.firstName),
      lastName: this.utilService.normalizePrimitive(x.lastName)
    }));

    if (rows.some(x => !x.name)) {
      this.swaCustomService.swaMsgInfo('Todas las personas de contacto deben tener un ID de contacto.');
      return false;
    }

    if (rows.some(x => !x.firstName)) {
      this.swaCustomService.swaMsgInfo('Todas las personas de contacto deben tener un nombre.');
      return false;
    }

    if (rows.some(x => !x.lastName)) {
      this.swaCustomService.swaMsgInfo('Todas las personas de contacto deben tener apellidos.');
      return false;
    }

    return true;
  }

  private validateAddresses(): boolean {
    const addresses = this.modeloAddressLines ?? [];

    const keys = addresses.map(x => {
      const address   = this.utilService.normalizePrimitive(x.address).toUpperCase();
      const adresType = this.utilService.normalizePrimitive(x.adresType).toUpperCase();
      const country   = this.utilService.normalizePrimitive(x.country).toUpperCase();
      const street    = this.utilService.normalizePrimitive(x.street).toUpperCase();
      const taxCode   = this.utilService.normalizePrimitive(x.taxCode).toUpperCase();

      return {
        address,
        adresType,
        country,
        street,
        taxCode,
        key: `${adresType}|${address}`
      };
    });

    if (keys.some(x => !x.address)) {
      this.swaCustomService.swaMsgInfo('Todas las direcciones deben tener un nombre.');
      return false;
    }

    if (keys.some(x => !x.adresType)) {
      this.swaCustomService.swaMsgInfo('Todas las direcciones deben tener un tipo.');
      return false;
    }

    if (keys.some(x => !x.country)) {
      this.swaCustomService.swaMsgInfo('Todas las direcciones deben tener un país.');
      return false;
    }

    if (keys.some(x => !x.street)) {
      this.swaCustomService.swaMsgInfo('Todas las direcciones deben tener una calle.');
      return false;
    }

    if (keys.some(x => x.adresType === 'S' && !x.taxCode)) {
      this.swaCustomService.swaMsgInfo('Todas las direcciones de entrega deben tener un impuesto.');
      return false;
    }

    const uniqueKeys = new Set(keys.map(x => x.key));

    if (uniqueKeys.size !== keys.length) {
      this.swaCustomService.swaMsgInfo('No puede repetir el mismo nombre de dirección para el mismo tipo.');
      return false;
    }

    return true;
  }

  private mapLinesContactsUpdate(): any[] {
    return this.modeloContactEmployeesLines
    .filter(line => this.h.p(line.name) !== '')
    .map<any>(line => ({
      cntctCode      : this.h.n(line.cntctCode),
      name           : this.h.p(line.name),
      firstName      : this.h.p(line.firstName),
      lastName       : this.h.p(line.lastName),
      e_MailL        : this.h.p(line.e_MailL),
      record         : this.h.n(line.record)
    }));
  }

  private mapLinesAddressUpdate(): any[] {
    return this.modeloAddressLines
    .filter(line => this.h.p(line.address) !== '')
    .map<any>(line => ({
      lineNum        : this.h.n(line.lineNum),
      address        : this.h.p(line.address),
      adresType      : this.h.p(line.adresType),
      country        : this.h.p(line.country),
      glblLocNum     : this.h.p(line.glblLocNum),
      state          : this.h.p(line.state),
      city           : this.h.p(line.city),
      county         : this.h.p(line.county),
      street         : this.h.p(line.street),
      taxCode        : this.h.p(line.taxCode),
      record         : this.h.n(line.record)
    }));
  }

  private getDefaultContactName(): string {
    return this.modeloContactEmployeesLines
      ?.find(x => x.default === 'X')
      ?.name || '';
  }

  private getDefaultAddressBillToDef(): string {
    return this.modeloAddressLines
      ?.find(x => x.default === 'X' && x.adresType === 'B')
      ?.address || '';
  }

  private getDefaultAddressBill(): string {
    return this.modeloAddressLines
      ?.find(x => x.default === 'X' && x.adresType === 'B')
      ?.street || '';
  }

  private getDefaultAddressShipToDef(): string {
    return this.modeloAddressLines
      ?.find(x => x.default === 'X' && x.adresType === 'S')
      ?.address || '';
  }

  private getDefaultAddressShip(): string {
    return this.modeloAddressLines
      ?.find(x => x.default === 'X' && x.adresType === 'S')
      ?.street || '';
  }

  //#endregion



  //#region <<< 10. NAVIGATION >>>

  back() {
    this.router.navigate(['/main/modulo-soc/panel-socio-negocios-list']);
  }

  //#endregion



  //#region <<< 20. CHANGE TRACKING >>>

  private setInitialSnapshot(): void {
    this.initialSnapshot = {
      form: this.modeloForm.getRawValue(),
      contacts: this.cloneContactLines(this.modeloContactEmployeesLines),
      addresses: this.cloneAddressLines(this.modeloAddressLines)
    };
  }

  private cloneContactLines(lines: IContactEmployees[]): any[] {
    return (lines ?? []).map(x => ({
      cntctCode : this.h.n(x.cntctCode),
      name      : this.h.p(x.name),
      firstName : this.h.p(x.firstName),
      lastName  : this.h.p(x.lastName),
      e_MailL   : this.h.p(x.e_MailL),
      default   : this.h.p(x.default),
      record    : this.h.n(x.record)
    }));
  }

  private cloneAddressLines(lines: IAddresses[]): any[] {
    return (lines ?? []).map(x => ({
      lineNum    : this.h.n(x.lineNum),
      address    : this.h.p(x.address),
      adresType  : this.h.p(x.adresType),
      country    : this.h.p(x.country),
      glblLocNum : this.h.p(x.glblLocNum),
      state      : this.h.p(x.state),
      city       : this.h.p(x.city),
      county     : this.h.p(x.county),
      street     : this.h.p(x.street),
      taxCode    : this.h.p(x.taxCode),
      default    : this.h.p(x.default),
      record     : this.h.n(x.record)
    }));
  }

  private watchChanges(): void {
    this.modeloForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.detectRealChanges());
  }

  detectRealChanges(): void {
    const invalidControls = Object.keys(this.modeloForm.controls)
    .filter(key => this.modeloForm.get(key)?.invalid)
    .map(key => ({
      key,
      value: this.modeloForm.get(key)?.value,
      errors: this.modeloForm.get(key)?.errors
    }));

    console.log('FORM VALID:', this.modeloForm.valid);
    console.log('INVALID CONTROLS:', invalidControls);

    const formsValid = this.modeloForm.valid;

    if (!formsValid || !this.initialSnapshot) {
      this.hasRealChanges = false;
      return;
    }

    const formChanged = this.utilService.hasFormChanged(
      this.modeloForm,
      this.initialSnapshot.form
    );

    const currentContacts = this.cloneContactLines(this.modeloContactEmployeesLines);
    const currentAddresses = this.cloneAddressLines(this.modeloAddressLines);

    const hasNewContacts = currentContacts.some(x => x.record === 1);
    const hasNewAddresses = currentAddresses.some(x => x.record === 1);

    const hasDeletedContacts =
      currentContacts.length !== this.initialSnapshot.contacts.length;

    const hasDeletedAddresses =
      currentAddresses.length !== this.initialSnapshot.addresses.length;

    const CONTACT_FIELDS_TO_COMPARE = [
      'name',
      'firstName',
      'lastName',
      'e_MailL',
      'default'
    ];

    const ADDRESS_FIELDS_TO_COMPARE = [
      'address',
      'adresType',
      'country',
      'glblLocNum',
      'state',
      'city',
      'county',
      'street',
      'taxCode',
      'default'
    ];

    const hasUpdatedContacts = currentContacts.some(line => {
      if (line.record !== 2) return false;

      const original = this.initialSnapshot.contacts.find(
        x => x.cntctCode === line.cntctCode
      );

      if (!original) return false;

      return CONTACT_FIELDS_TO_COMPARE.some(field =>
        line[field] !== original[field]
      );
    });

    const hasUpdatedAddresses = currentAddresses.some(line => {
      if (line.record !== 2) return false;

      const original = this.initialSnapshot.addresses.find(
        x => x.lineNum === line.lineNum
      );

      if (!original) return false;

      return ADDRESS_FIELDS_TO_COMPARE.some(field =>
        line[field] !== original[field]
      );
    });

    this.hasRealChanges =
      formChanged ||
      hasNewContacts ||
      hasNewAddresses ||
      hasDeletedContacts ||
      hasDeletedAddresses ||
      hasUpdatedContacts ||
      hasUpdatedAddresses;
  }

  //#endregion
}
