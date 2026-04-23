import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { SocioNegocioModel } from '../../../models/socio-negocio.model';
import { BusinessPartnersService } from '../../../services/business-partners.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { UtilService } from 'src/app/services/util.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-soc-panel-socio-negocios-view',
  templateUrl: './panel-socio-negocios-view.component.html',
  styleUrls: ['./panel-socio-negocios-view.component.css']
})
export class PanelSocioNegociosViewComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject<void>();

  titulo = 'Socio de Negocio';
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();
  modeloForm: FormGroup;
  modelo: SocioNegocioModel = new SocioNegocioModel();
  idCardCode: string;
  isloading: boolean = false;

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

  listTiposPersona: SelectItem[] = [
    { label: 'Jurídica', value: 'TPJ' },
    { label: 'Natural', value: 'TPN' },
    { label: 'Sujeto no domiciliado', value: 'SND' },
    { label: 'Adquirente - ticket', value: 'AC' },
    { label: 'Jurídica Extranjera', value: 'TPJE' },
    { label: 'Natural Extranjera', value: 'TPNE' }
  ];

  listAcreedorTransportista: SelectItem[] = [
    { label: 'No', value: 'N' },
    { label: 'Si', value: 'Y' }
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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: UtilService,
    private businessPartnersService: BusinessPartnersService,
    private readonly swaCustomService: SwaCustomService
  ) {}

  ngOnInit() {
    this.onBuildForm();
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.idCardCode = params['id'];
        this.getSocioNegocio();
        this.cargarCondicionesPago();
        this.cargarVendedores();
    });
  }

  onBuildForm() {
    this.modeloForm = this.fb.group({
      'cardCode': new FormControl({value: '', disabled: true}),
      'cardName': new FormControl({value: '', disabled: true}),
      'cardType': new FormControl({value: 'C', disabled: true}),
      'groupCode': new FormControl({value: '', disabled: true}),
      'licTradNum': new FormControl({value: '', disabled: true}),
      'phone1': new FormControl({value: '', disabled: true}),
      'emailAddress': new FormControl({value: '', disabled: true}),
      'currency': new FormControl({value: '##', disabled: true}),
      'u_BPP_BPAT': new FormControl({value: 'N', disabled: true}),
      'u_BPP_BPTD': new FormControl({value: '6', disabled: true}),
      'u_BPP_BPTP': new FormControl({value: 'TPJ', disabled: true}),
      'u_BPP_BPNO': new FormControl({value: '', disabled: true}),
      'u_BPP_BPAP': new FormControl({value: '', disabled: true}),
      'u_BPP_BPAM': new FormControl({value: '', disabled: true}),
      'u_FIB_Email2': new FormControl({value: '', disabled: true}),
      'u_FIB_Email3': new FormControl({value: '', disabled: true}),
      'u_FIB_Transp': new FormControl({value: 'N', disabled: true}),
      'u_FIB_Creed': new FormControl({value: 'N', disabled: true}),
      'u_FIB_Divi': new FormControl({value: '01', disabled: true}),
      'u_FIB_Sector': new FormControl({value: '01', disabled: true}),
      'groupNum': new FormControl({value: null, disabled: true}),
      'creditLine': new FormControl({value: 0, disabled: true}),
      'slpCode': new FormControl({value: null, disabled: true}),
      'cellular': new FormControl({value: '', disabled: true}),
      'notes': new FormControl({value: '', disabled: true}),
      'validFor': new FormControl({value: 'Y', disabled: true})
    });
  }

  getSocioNegocio() {
    this.isloading = true;
    this.businessPartnersService.getBusinessPartnerByCode(this.idCardCode)
    .pipe(takeUntil(this.destroy$))
    .subscribe((data: SocioNegocioModel) => {
      this.isloading = false;
      if (data) {
        this.modelo = data;
        this.modeloForm.patchValue({
          cardCode: data.cardCode,
          cardName: data.cardName,
          cardType: data.cardType,
          groupCode: data.groupCode,
          licTradNum: data.licTradNum,
          phone1: data.phone1,
          emailAddress: data.emailAddress,
          currency: data.currency,
          u_BPP_BPAT: data.u_BPP_BPAT,
          u_BPP_BPTD: data.u_BPP_BPTD,
          u_BPP_BPTP: data.u_BPP_BPTP,
          u_FIB_Divi: data.u_FIB_Divi,
          u_FIB_Sector: data.u_FIB_Sector,
          groupNum: data.groupNum,
          creditLine: data.creditLine,
          slpCode: data.slpCode,
          cellular: data.cellular,
          notes: data.notes,
          validFor: data.validFor || 'Y'
        });

        if (this.modelo.linesPayAddress || this.modelo.linesShipAddress) {
          this.modelo.addresses = [];
          
          if (this.modelo.linesPayAddress) {
            this.modelo.linesPayAddress.forEach(addr => {
              addr.addressName = addr.address;
              addr.addressType = 'B';
              this.modelo.addresses.push(addr);
            });
          }

          if (this.modelo.linesShipAddress) {
            this.modelo.linesShipAddress.forEach(addr => {
              addr.addressName = addr.address;
              addr.addressType = 'S';
              this.modelo.addresses.push(addr);
            });
          }
        } else if (this.modelo.addresses) {
            this.modelo.addresses.forEach(addr => {
               if (addr.address && !addr.addressName) addr.addressName = addr.address;
               if (addr.adresType && !addr.addressType) addr.addressType = addr.adresType;
            });
        }

        if (this.modelo.contactList) {
          this.modelo.contactEmployees = this.modelo.contactList.map(contact => {
            return {
              ...contact,
              e_Mail: contact.e_Mail || contact.e_MailL
            };
          });
        }

        if (this.modelo.contactEmployees) {
          this.modelo.contactEmployees.forEach(contact => {
            if (contact.e_MailL && !contact.e_Mail) contact.e_Mail = contact.e_MailL;
          });
        }

        this.cargarGruposSocio(data.cardType);
      }
    },
    (error) => {
      this.isloading = false;
      this.swaCustomService.swaMsgError(error?.error?.resultadoDescripcion || error?.message);
    });
  }

  cargarGruposSocio(groupType: string) {
    this.businessPartnersService.getBusinessPartnerGroups(groupType)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: any[]) => {
          this.listGruposSocio = (res || []).map(g => ({ label: g.groupName, value: g.groupCode }));
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

  back() {
    this.router.navigate(['/main/modulo-soc/panel-socio-negocios-list']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
