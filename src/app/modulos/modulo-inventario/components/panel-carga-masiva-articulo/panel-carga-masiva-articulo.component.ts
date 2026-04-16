import { finalize, Subject, takeUntil } from 'rxjs';
import * as XLSX from 'xlsx';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';

import { UtilService } from 'src/app/services/util.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { IArticulo } from '../../interfaces/items.interface';
import { ArticuloModel } from '../../models/items.model';
import { ItemsService } from '../../services/items.service';
import { FormBuilder, FormGroup } from '@angular/forms';


@Component({
  selector: 'app-inv-panel-carga-masiva-articulo',
  templateUrl: './panel-carga-masiva-articulo.component.html',
  styleUrls: ['./panel-carga-masiva-articulo.component.css']
})
export class PanelCargaMasivaArticuloComponent implements OnInit, OnDestroy {
  // Lifecycle management
  private readonly destroy$                     = new Subject<void>();

  // Forms
  modeloForm                                  : FormGroup;

  // Configuration
  readonly titulo                               = 'Carga masiva de artículos';
  buttonAcces                                   : ButtonAcces = new ButtonAcces();
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();

  // UI State
  isSaving                                      = false;
  isDisplay                                     = false;
  isDisplayUpload                               = false;

  // Table configuration
  columnas                                      : any[] = [];
  opciones                                      : any[] = [];

  // Data
  modelo                                        : IArticulo[] = [];


  constructor(
    private readonly fb: FormBuilder,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private readonly swaCustomService: SwaCustomService,
    private readonly userContextService: UserContextService,
    private readonly itemsService: ItemsService,
    public  readonly utilService: UtilService
  ) {}

  // ===========================
  // Lifecycle Hooks
  // ===========================

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===========================
  // Initialization
  // ===========================

  private initializeComponent(): void {
    this.buildForms();
    this.buildColumns();
  }

  private buildForms(): void {
    this.modeloForm = this.fb.group({
      isEntrada                 : [false],
      isSalida                  : [false],
    });
    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-inv-panel-carga-masiva-articulo');
  }

  private buildColumns(): void {
    this.columnas = [
      { field: 'itemCode',          header: 'Código' },
      { field: 'itemName',          header: 'Descripción' },
      { field: 'u_FIB_ItemCode',    header: 'Código origen' },
      { field: 'u_FIB_ItemName',    header: 'Descripción origen' },
      { field: 'itmsGrpCod',        header: 'Grupo' },
      { field: 'invntItem',         header: 'Artículo de inventario' },
      { field: 'sellItem',          header: 'Artículo venta' },
      { field: 'prchseItem',        header: 'Artículo de compra' },
      { field: 'wTLiable',          header: 'Sujeto a retención de impuesto' },
      { field: 'vatLiable',         header: 'Sujeto a impuesto' },
      { field: 'indirctTax',        header: 'Impuesto indirecto' },
      { field: 'salUnitMsr',        header: 'UM de venta' },
      { field: 'buyUnitMsr',        header: 'UM de compra' },
      { field: 'invntryUom',        header: 'UM de inventario' },
      { field: 'dfltWH',            header: 'Almacén por defecto' },
      { field: 'onHand',            header: 'Stock' },
      { field: 'taxCodeAR',         header: 'Código de impuesto' },
      { field: 'u_BPP_TIPEXIST',    header: 'Tipo existencia' },
      { field: 'u_BPP_TIPUNMED',    header: 'Tipo Unidad de medida' },
      { field: 'u_S_PartAranc1',    header: 'Partida Arancelaria' },
      { field: 'u_S_PartAranc2',    header: 'Part. Arancelaria Colombia' },
      { field: 'u_FIB_ECU',         header: 'Part. Arancelaria Ecuador' },
      { field: 'u_S_CCosto',        header: 'Centro Costo Artículo' },
      { field: 'u_FIB_PESO',        header: 'Peso Item' },
      { field: 'u_FIB_SGRUP',       header: 'Sub Grupo' },
      { field: 'u_FIB_SGRUPO2',     header: 'Sub Grupo 2' },
      { field: 'u_FIB_LINNEG',      header: 'Línea de Negocio' },
    ];
  }

  onClickImport(): void {
    this.isDisplayUpload = true;
  }

  onClickUpload(file: any): void {
    this.isDisplayUpload = false;
    // Aceptamos tanto File como el evento de p-fileUpload (event.files[0])
    const fileObj: File = (file instanceof File) ? file : (file?.files ? file.files[0] : file);

    if (!fileObj || !(fileObj instanceof File)) {
      this.swaCustomService.swaMsgInfo('Archivo inválido.');
      return;
    }

    if (fileObj.size === 0) {
      this.swaCustomService.swaMsgInfo('El archivo está vacío.');
      return;
    }

    // Leer archivo Excel con SheetJS (xlsx)
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convertir a JSON (array de filas). defval mantiene celdas vacías como null
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: null });

        // Reiniciar modelo
        this.modelo = [];


        // Map de alias de encabezados a campos del modelo IArticulo
        const mapHeaderToField = (row: any) => {
          const pick = (aliases: string[]) => {
            for (const a of aliases) {
              if (a in row && row[a] !== null && row[a] !== undefined) return row[a];
            }
            return null;
          };

          const out: any = {};
          out.itemCode        = pick(['itemCode', 'ItemCode']);
          out.itemName        = pick(['itemName', 'ItemName']);
          out.u_FIB_ItemCode  = pick(['u_FIB_ItemCode', 'U_FIB_ItemCode']);
          out.u_FIB_ItemName  = pick(['u_FIB_ItemName', 'U_FIB_ItemName']);
          out.itmsGrpCod      = pick(['itmsGrpCod', 'ItmsGrpCod']);
          out.invntItem       = pick(['invntItem', 'InvntItem']);
          out.sellItem        = pick(['sellItem', 'SellItem']);
          out.prchseItem      = pick(['prchseItem', 'PrchseItem']);
          out.wTLiable        = pick(['wTLiable', 'WTLiable']);
          out.vatLiable       = pick(['vatLiable', 'VatLiable']);
          out.indirctTax      = pick(['indirctTax', 'IndirctTax']);
          out.salUnitMsr      = pick(['salUnitMsr', 'SalUnitMsr']);
          out.buyUnitMsr      = pick(['buyUnitMsr', 'BuyUnitMsr']);
          out.invntryUom      = pick(['invntryUom', 'InvntryUom']);
          out.dfltWH          = pick(['dfltWH', 'DfltWH']);
          out.onHand          = pick(['onHand', 'OnHand', 'Stock', 'onhand']);
          out.taxCodeAR       = pick(['taxCodeAR', 'TaxCodeAR']);
          out.u_BPP_TIPEXIST  = pick(['u_BPP_TIPEXIST', 'U_BPP_TIPEXIST']);
          out.u_BPP_TIPUNMED  = pick(['u_BPP_TIPUNMED', 'U_BPP_TIPUNMED']);
          out.u_S_PartAranc1  = pick(['u_S_PartAranc1', 'U_S_PartAranc1']);
          out.u_S_PartAranc2  = pick(['u_S_PartAranc2', 'U_S_PartAranc2']);
          out.u_S_CCosto      = pick(['u_S_CCosto', 'U_S_CCosto']);
          out.u_FIB_PESO      = pick(['u_FIB_PESO', 'U_FIB_PESO']);
          out.u_FIB_ECU       = pick(['u_FIB_ECU', 'U_FIB_ECU']);
          out.u_FIB_SGRUP     = pick(['u_FIB_SGRUP', 'U_FIB_SGRUP']);
          out.u_FIB_SGRUPO2   = pick(['u_FIB_SGRUPO2', 'U_FIB_SGRUPO2']);
          out.u_FIB_LINNEG    = pick(['u_FIB_LINNEG', 'U_FIB_LINNEG']);

          return out;
        };

        for (const r of rows) {
          const m = mapHeaderToField(r || {});
          const articulo: any = {
            itemCode        : (m.itemCode ?? '').toString(),
            itemName        : (m.itemName ?? '').toString(),
            u_FIB_ItemCode  : (m.u_FIB_ItemCode ?? '').toString(),
            u_FIB_ItemName  : (m.u_FIB_ItemName ?? '').toString(),
            itmsGrpCod      : m.itmsGrpCod !== null ? Number(m.itmsGrpCod) : 0,
            invntItem       : (m.invntItem ?? '').toString(),
            sellItem        : (m.sellItem ?? '').toString(),
            prchseItem      : (m.prchseItem ?? '').toString(),
            wTLiable        : (m.wTLiable ?? '').toString(),
            vatLiable       : (m.vatLiable ?? '').toString(),
            indirctTax      : (m.indirctTax ?? '').toString(),
            salUnitMsr      : (m.salUnitMsr ?? '').toString(),
            buyUnitMsr      : (m.buyUnitMsr ?? '').toString(),
            invntryUom      : (m.invntryUom ?? '').toString(),
            dfltWH          : (m.dfltWH ?? '').toString(),
            onHand          : m.onHand !== null ? Number(m.onHand) : 0,
            taxCodeAR       : (m.taxCodeAR ?? '').toString(),
            u_BPP_TIPEXIST  : (m.u_BPP_TIPEXIST ?? '').toString(),
            u_BPP_TIPUNMED  : (m.u_BPP_TIPUNMED ?? '').toString(),
            u_S_PartAranc1  : (m.u_S_PartAranc1 ?? '').toString(),
            u_S_PartAranc2  : (m.u_S_PartAranc2 ?? '').toString(),
            u_S_CCosto      : (m.u_S_CCosto ?? '').toString(),
            u_FIB_PESO      : m.u_FIB_PESO !== null ? Number(m.u_FIB_PESO) : 0,
            u_FIB_ECU       : (m.u_FIB_ECU ?? '').toString(),
            u_FIB_SGRUP     : (m.u_FIB_SGRUP ?? '').toString(),
            u_FIB_SGRUPO2   : (m.u_FIB_SGRUPO2 ?? '').toString(),
            u_FIB_LINNEG    : (m.u_FIB_LINNEG ?? '').toString()
          };

          this.modelo .push(articulo as IArticulo);
        }

        this.swaCustomService.swaMsgExito('Archivo procesado. Filas: ' + this.modelo.length);
      } catch (err: any) {
        this.utilService.handleErrorSingle(err, 'onClickUpload', this.swaCustomService);
      }
    };

    reader.onerror = (err) => {
      this.utilService.handleErrorSingle(err, 'onClickUpload', this.swaCustomService);
    };

    reader.readAsArrayBuffer(fileObj);
  }

  private onValidatedSave(): boolean {
    return true;
  }

  private save(): void {
    this.isSaving = true;

    if (!this.onValidatedSave()) {
      return;
    }

    const modeloToSave: ArticuloModel = this.modeloForm.getRawValue()

    const mapped: ArticuloModel[] = (this.modelo || []).map((m: IArticulo) => {
      const a = new ArticuloModel();
      a.itemCode       = (m.itemCode ?? '').toString();
      a.itemName       = (m.itemName ?? '').toString();
      a.u_FIB_ItemCode = (m.u_FIB_ItemCode ?? '').toString();
      a.u_FIB_ItemName = (m.u_FIB_ItemName ?? '').toString();
      a.itmsGrpCod     = m.itmsGrpCod ?? 0;
      a.invntItem      = (m.invntItem ?? '').toString();
      a.sellItem       = (m.sellItem ?? '').toString();
      a.prchseItem     = (m.prchseItem ?? '').toString();
      a.wTLiable       = (m.wTLiable ?? '').toString();
      a.vatLiable      = (m.vatLiable ?? '').toString();
      a.indirctTax     = (m.indirctTax ?? '').toString();
      a.salUnitMsr     = (m.salUnitMsr ?? '').toString();
      a.buyUnitMsr     = (m.buyUnitMsr ?? '').toString();
      a.invntryUom     = (m.invntryUom ?? '').toString();
      a.dfltWH         = (m.dfltWH ?? '').toString();
      a.onHand         = m.onHand ?? 0;
      a.taxCodeAR      = (m.taxCodeAR ?? '').toString();
      a.u_BPP_TIPEXIST = (m.u_BPP_TIPEXIST ?? '').toString();
      a.u_BPP_TIPUNMED = (m.u_BPP_TIPUNMED ?? '').toString();
      a.u_S_PartAranc1 = (m.u_S_PartAranc1 ?? '').toString();
      a.u_S_PartAranc2 = (m.u_S_PartAranc2 ?? '').toString();
      a.u_FIB_ECU      = (m.u_FIB_ECU ?? '').toString();
      a.u_S_CCosto     = (m.u_S_CCosto ?? '').toString();
      a.u_FIB_PESO     = m.u_FIB_PESO ?? 0;
      a.u_FIB_SGRUP    = (m.u_FIB_SGRUP ?? '').toString();
      a.u_FIB_SGRUPO2  = (m.u_FIB_SGRUPO2 ?? '').toString();
      a.u_FIB_LINNEG   = (m.u_FIB_LINNEG ?? '').toString();
      a.u_UsrCreate    = this.userContextService.getIdUsuario();
      return a;
    });

    modeloToSave.line = mapped;

    this.itemsService.setCreateMassive(modeloToSave)
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isSaving = false;
      })
    )
    .subscribe({
      next: () => {
        this.swaCustomService.swaMsgExito(null);
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'save', this.swaCustomService);
      }
    });
  }

  onClickSave(): void {
    this.swaCustomService.swaConfirmation(
      this.globalConstants.titleGrabar,
      this.globalConstants.subTitleGrabar,
      this.globalConstants.icoSwalQuestion
    ).then((result) => {
      if (result.isConfirmed) {
        this.save();
      }
    });
  }
}
