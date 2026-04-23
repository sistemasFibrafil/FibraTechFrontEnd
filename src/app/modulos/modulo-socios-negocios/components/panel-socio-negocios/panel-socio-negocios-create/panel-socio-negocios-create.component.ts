import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { SocioNegocioModel } from '../../../models/socio-negocio.model';
import { BusinessPartnersService } from '../../../services/business-partners.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { UtilService } from 'src/app/services/util.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { SelectItem, MenuItem } from 'primeng/api';

@Component({
  selector: 'app-soc-panel-socio-negocios-create',
  templateUrl: './panel-socio-negocios-create.component.html',
  styleUrls: ['./panel-socio-negocios-create.component.css']
})
export class PanelSocioNegociosCreateComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject<void>();

  titulo = 'Socio de Negocio';
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();
  modeloForm: FormGroup;
  modelo: SocioNegocioModel = new SocioNegocioModel();

  opcionesDirecciones: MenuItem[];
  opcionesContactos: MenuItem[];
  direccionSelected: any;
  contactoSelected: any;

  listTiposSocio: SelectItem[] = [
    { label: 'Cliente', value: 'C' },
    { label: 'Proveedor', value: 'S' },
    { label: 'Lead', value: 'L' }
  ];

  listMonedas: SelectItem[] = [
    { label: 'Todas', value: '##' },
    { label: 'Soles', value: 'SOL' },
    { label: 'Dolares americanos', value: 'USD' },
    { label: 'Euro', value: 'EUR' }
  ];

  listTiposDireccion: SelectItem[] = [
    { label: 'Factura (B)', value: 'B' },
    { label: 'Guía (S)', value: 'S' }
  ];

  listTiposPersona: SelectItem[] = [
    { label: 'Jurídica', value: 'TPJ' },
    { label: 'Natural', value: 'TPN' },
    { label: 'Sujeto no domiciliado', value: 'SND' },
    { label: 'Adquirente - ticket', value: 'AC' },
    { label: 'Jurídica Extranjera', value: 'TPJE' },
    { label: 'Natural Extranjera', value: 'TPNE' }
  ];

  listTiposDocumento: SelectItem[] = [
    { label: '0 - DOC.TRIB.NO.DOM.SIN.RUC', value: '0' },
    { label: '1 - Documento Nacional de Identidad', value: '1' },
    { label: '4 - Carnet de extranjería', value: '4' },
    { label: '6 - Registro Unico de Contribuyentes', value: '6' },
    { label: '7 - Pasaporte', value: '7' },
    { label: 'A - Cédula Diplomática de identidad', value: 'A' },
    { label: 'B - DOC.IDENT.PAIS.RESIDENCIA-NO.D', value: 'B' },
    { label: 'C - Tax Identification Number (TIN)', value: 'C' },
    { label: 'D - Identification Number (IN)', value: 'D' },
    { label: 'E - TAM- Tarjeta Andina de Migración', value: 'E' }
  ];

  listGruposSocio: SelectItem[] = [];
  listCondicionesPago: SelectItem[] = [];
  listVendedores: SelectItem[] = [];
  listPaises: SelectItem[] = [];
  mapEstados: { [key: string]: SelectItem[] } = {};
  mapProvincias: { [key: string]: SelectItem[] } = {};
  mapDistritos: { [key: string]: SelectItem[] } = {};

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private utilService: UtilService,
    private businessPartnersService: BusinessPartnersService,
    private readonly swaCustomService: SwaCustomService
  ) {}

  ngOnInit() {
    this.onBuildForm();
    this.opcionesTabla();
    this.initDefaultLines();
    this.cargarCondicionesPago();
    this.cargarVendedores();
    this.cargarPaises();
  }

  initDefaultLines() {
    this.onAddDireccion();
    this.onAddContacto();
  }

  opcionesTabla() {
    this.opcionesDirecciones = [
      { label: 'Añadir línea', icon: 'pi pi-plus', command: () => this.onAddDireccion() },
      { label: 'Borrar línea', icon: 'pi pi-trash', command: () => this.onDeleteDireccion(this.direccionSelected) }
    ];
    this.opcionesContactos = [
      { label: 'Añadir línea', icon: 'pi pi-plus', command: () => this.onAddContacto() },
      { label: 'Borrar línea', icon: 'pi pi-trash', command: () => this.onDeleteContacto(this.contactoSelected) }
    ];
  }

  onBuildForm() {
    this.modeloForm = this.fb.group({
      'cardCode': new FormControl({value: '', disabled: true}, Validators.compose([Validators.required, Validators.maxLength(15)])),
      'cardName': new FormControl('', Validators.compose([Validators.required, Validators.maxLength(100)])),
      'cardType': new FormControl('C', Validators.compose([Validators.required])),
      'groupCode': new FormControl('', Validators.compose([Validators.required])),
      'licTradNum': new FormControl('', Validators.compose([Validators.required, Validators.maxLength(20)])),
      'phone1': new FormControl(''),
      'emailAddress': new FormControl('', Validators.compose([Validators.email])),
      'currency': new FormControl('##', Validators.compose([Validators.required])),
      'u_BPP_BPAT': new FormControl('N', Validators.compose([Validators.required])),
      'u_BPP_BPTD': new FormControl('6', Validators.compose([Validators.required])),
      'u_BPP_BPTP': new FormControl('TPJ', Validators.compose([Validators.required])),
      'u_FIB_Divi': new FormControl('01', Validators.compose([Validators.required])),
      'u_FIB_Sector': new FormControl('01', Validators.compose([Validators.required])),
      'groupNum': new FormControl(null),
      'creditLine': new FormControl(0),
      'slpCode': new FormControl(null),
      'cellular': new FormControl(''),
      'notes': new FormControl('')
    });

    this.modeloForm.get('cardType').valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if(value) {
          this.cargarGruposSocio(value);
          this.generateCardCode();
        }
    });

    this.modeloForm.get('licTradNum').valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.generateCardCode();
    });

    // Load initial based on default type 'C'
    this.cargarGruposSocio(this.modeloForm.get('cardType').value);
  }

  generateCardCode() {
    let type = this.modeloForm.get('cardType').value || '';
    let doc = this.modeloForm.get('licTradNum').value || '';
    if (type && doc) {
      doc = doc.trim().replace(/\s+/g, '');
      this.modeloForm.patchValue({ cardCode: (type + doc).toUpperCase() });
    } else {
      this.modeloForm.patchValue({ cardCode: '' });
    }
  }

  cargarGruposSocio(groupType: string) {
    this.businessPartnersService.getBusinessPartnerGroups(groupType)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: any[]) => {
          this.listGruposSocio = (res || []).map(g => ({ label: g.groupName, value: g.groupCode }));
          const currentGroup = this.modeloForm.get('groupCode').value;
          if (this.listGruposSocio.length > 0) {
            const exists = this.listGruposSocio.find(x => x.value === currentGroup);
            if (!exists) {
              this.modeloForm.patchValue({ groupCode: this.listGruposSocio[0].value });
            }
          } else {
            this.modeloForm.patchValue({ groupCode: null });
          }
        },
        (error) => {
          console.error('Error al cargar grupos:', error);
        }
      );
  }

  cargarCondicionesPago() {
    this.businessPartnersService.getPaymentTermsTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: any[]) => {
          this.listCondicionesPago = (res || []).map(cp => ({ label: cp.pymntGroup, value: cp.groupNum }));
        },
        (error) => {
          console.error('Error al cargar condiciones de pago:', error);
        }
      );
  }

  cargarVendedores() {
    this.businessPartnersService.getSalesPersonsList()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: any[]) => {
          this.listVendedores = (res || []).map(v => ({ label: v.slpName, value: v.slpCode }));
        },
        (error) => {
          console.error('Error al cargar vendedores:', error);
        }
      );
  }

  cargarPaises() {
    this.businessPartnersService.getCountries()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: any) => {
          const data = Array.isArray(res) ? res : (res?.dataList || res?.data || res?.result || []);
          this.listPaises = data.map(p => ({ label: p.name || p.Name, value: p.code || p.Code }));
          this.cargarEstados('PE');
        },
        (error) => {
          console.error('Error al cargar países:', error);
        }
      );
  }

  cargarEstados(countryCode: string) {
    if (!countryCode || this.mapEstados[countryCode]) return;
    this.businessPartnersService.getStates(countryCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: any) => {
          const data = Array.isArray(res) ? res : (res?.dataList || res?.data || res?.result || []);
          this.mapEstados[countryCode] = data.map(s => ({ 
            label: s.name || s.Name, 
            value: s.code || s.Code 
          }));
        },
        (error) => {
          console.error('Error al cargar estados:', error);
        }
      );
  }

  onCountryChange(addr: any) {
    addr.state = null;
    addr.county = null;
    addr.city = null;
    addr.glblLocNum = '';
    if (addr.country) {
      this.cargarEstados(addr.country);
    }
  }

  onStateChange(addr: any) {
    addr.county = null;
    addr.city = null;
    addr.glblLocNum = '';
    if (addr.state && addr.country) {
      const estados = this.mapEstados[addr.country];
      const item = estados.find(x => x.value === addr.state);
      if (item) {
        const nombreDpto = this.utilService.eliminarTildes(item.label);
        this.cargarProvincias(nombreDpto, addr.state);
      }
    }
  }

  cargarProvincias(dptoNombre: string, dptoCodigo: string) {
    if (!dptoNombre || this.mapProvincias[dptoCodigo]) return;
    this.businessPartnersService.getProvincias(dptoNombre)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: any) => {
          const data = Array.isArray(res) ? res : (res?.dataList || res?.data || res?.result || []);
          this.mapProvincias[dptoCodigo] = data.map(p => {
            const name = typeof p === 'string' ? p : (p.name || p.Name || p.provincia || '');
            return { label: name, value: name };
          });
        },
        (error) => {
          console.error('Error al cargar provincias:', error);
        }
      );
  }

  onProvinciaChange(addr: any) {
    addr.city = null;
    addr.glblLocNum = '';
    if (addr.state && addr.county && addr.country) {
      const estados = this.mapEstados[addr.country];
      const item = estados.find(x => x.value === addr.state);
      if (item) {
        const nombreDpto = this.utilService.eliminarTildes(item.label);
        this.cargarDistritos(nombreDpto, addr.county, addr.state);
      }
    }
  }

  cargarDistritos(dptoNombre: string, provNombre: string, dptoCodigo: string) {
    const key = `${dptoCodigo}_${provNombre}`;
    if (this.mapDistritos[key]) return;
    this.businessPartnersService.getDistritos(dptoNombre, provNombre)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: any) => {
          const data = Array.isArray(res) ? res : (res?.dataList || res?.data || res?.result || []);
          this.mapDistritos[key] = data.map(d => ({ 
            label: d.distrito || d.name || d.Name || '', 
            value: d.code || d.Code || '' 
          }));
        },
        (error) => {
          console.error('Error al cargar distritos:', error);
        }
      );
  }

  onDistritoChange(addr: any) {
    if (addr.state && addr.county && addr.city) {
      const key = `${addr.state}_${addr.county}`;
      const distritos = this.mapDistritos[key];
      if (distritos) {
        const item = distritos.find(x => x.label === addr.city);
        if (item) {
          addr.glblLocNum = item.value;
        }
      }
    }
  }

  onClickSave() {
    const rawForm = this.modeloForm.getRawValue();

    this.modelo.cardCode = this.utilService.convertirMayuscula(rawForm.cardCode);
    this.modelo.cardName = this.utilService.convertirMayuscula(rawForm.cardName);
    this.modelo.cardType = rawForm.cardType;
    this.modelo.groupCode = Number(rawForm.groupCode);
    this.modelo.licTradNum = rawForm.licTradNum;
    this.modelo.phone1 = rawForm.phone1;
    this.modelo.emailAddress = rawForm.emailAddress;
    this.modelo.currency = rawForm.currency;
    this.modelo.u_BPP_BPAT = rawForm.u_BPP_BPAT;
    this.modelo.u_BPP_BPTD = rawForm.u_BPP_BPTD;
    this.modelo.u_BPP_BPTP = rawForm.u_BPP_BPTP;
    this.modelo.u_FIB_Divi = rawForm.u_FIB_Divi;
    this.modelo.u_FIB_Sector = rawForm.u_FIB_Sector;

    this.modelo.groupNum = (rawForm.groupNum !== null && rawForm.groupNum !== undefined) ? Number(rawForm.groupNum) : null;
    this.modelo.creditLine = (rawForm.creditLine !== null && rawForm.creditLine !== undefined) ? Number(rawForm.creditLine) : 0;
    this.modelo.slpCode = (rawForm.slpCode !== null && rawForm.slpCode !== undefined) ? Number(rawForm.slpCode) : -1;
    
    this.modelo.cellular = rawForm.cellular;
    this.modelo.notes = rawForm.notes;

    if (this.modelo.contactEmployees && this.modelo.contactEmployees.length > 0) {
      const mainContact = this.modelo.contactEmployees[0];
      this.modelo.cntctPrsn = mainContact.name || mainContact.firstName;
    }

    this.businessPartnersService.setCreateBusinessPartner(this.modelo)
    .pipe(takeUntil(this.destroy$))
    .subscribe(
      () =>  {
        this.swaCustomService.swaMsgExito(null);
        this.back(); 
      },
      (error) => {
        this.swaCustomService.swaMsgError(error?.error?.resultadoDescripcion || error?.message);
    });
  }

  back() {
    this.router.navigate(['/main/modulo-soc/panel-socio-negocios-list']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onAddDireccion() {
    if(!this.modelo.addresses) this.modelo.addresses = [];
    this.modelo.addresses.push({
      addressName: '',
      addressType: 'B',
      street: '',
      city: '',
      country: 'PE'
    });
  }

  onDeleteDireccion(value: any) {
    if(!value) return;
    let index = this.modelo.addresses?.indexOf(value);
    if(index !== -1 && index !== undefined) {
      this.modelo.addresses?.splice(index, 1);
    }
  }

  onSelectDireccion(modelo: any) {
    this.direccionSelected = modelo;
  }

  onAddContacto() {
    if(!this.modelo.contactEmployees) this.modelo.contactEmployees = [];
    this.modelo.contactEmployees.push({
      name: '',
      firstName: '',
      lastName: '',
      e_Mail: ''
    });
  }

  onDeleteContacto(value: any) {
    if(!value) return;
    let index = this.modelo.contactEmployees?.indexOf(value);
    if(index !== -1 && index !== undefined) {
      this.modelo.contactEmployees?.splice(index, 1);
    }
  }

  onSelectContacto(modelo: any) {
    this.contactoSelected = modelo;
  }
}
