import * as XLSX from 'xlsx';
import { finalize, Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';

import { GlobalsConstantsForm } from '@app/constants/globals-constants-form';

import { ButtonAcces } from '@app/models/acceso-button.model';
import { ArticuloModel, ArticuloUpdateModel } from '@app/modulos/modulo-inventario/models/items.model';

import { IArticulo } from '@app/modulos/modulo-inventario/interfaces/items.interface';

import { UtilService } from '@app/services/util.service';
import { SwaCustomService } from '@app/services/swa-custom.service';
import { UserContextService } from '@app/services/user-context.service';
import { AccesoOpcionesService } from '@app/services/acceso-opciones.service';
import { ItemsService } from '@app/modulos/modulo-inventario/services/items.service';


@Component({
  selector: 'app-inv-panel-update-massive-items',
  templateUrl: './panel-update-massive-items.component.html',
  styleUrls: ['./panel-update-massive-items.component.css']
})
export class PanelUpdateMassiveItemsComponent implements OnInit, OnDestroy {
  // Lifecycle management
  private readonly destroy$                     = new Subject<void>();

  // Forms
  modeloForm                                    : FormGroup;

  // Configuration
  readonly titulo                               = 'Actualización masiva de artículos';
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
    private readonly itemsService: ItemsService,
    private readonly swaCustomService: SwaCustomService,
    private readonly userContextService: UserContextService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
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
    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-inv-panel-update-massive-items');

    this.buildColumns();
  }

  private buildColumns(): void {
    this.columnas = [
      { field: 'itemCode',          header: 'Código' },
      { field: 'itemName',          header: 'Descripción' },
      { field: 'itmsGrpCod',        header: 'Grupo' },
      { field: 'salUnitMsr',        header: 'UM de venta' },
      { field: 'buyUnitMsr',        header: 'UM de compra' },
      { field: 'invntryUom',        header: 'UM de inventario' },
      { field: 'u_BPP_TIPEXIST',    header: 'Tipo existencia' },
      { field: 'u_BPP_TIPUNMED',    header: 'Tipo Unidad de medida' },
      { field: 'u_S_PartAranc1',    header: 'Partida Arancelaria' },
      { field: 'u_S_PartAranc2',    header: 'Partida Arancelaria Colombia' },
      { field: 'u_FIB_ECU',         header: 'Partida Arancelaria Ecuador' },
      { field: 'u_S_CCosto',        header: 'Centro Costo Artículo' },
      { field: 'u_FIB_PESO',        header: 'Peso Item' },
      { field: 'u_FIB_SGRUP',       header: 'Sub Grupo' },
      { field: 'u_FIB_SGRUPO2',     header: 'Sub Grupo 2' },
      { field: 'u_FIB_LINNEG',      header: 'Línea de Negocio' }
    ];
  }

  onClickImport(): void {
    this.isDisplayUpload = true;
  }

  onClickUpload(file: any): void {
    this.isDisplayUpload = false;

    const fileObj: File = file instanceof File
      ? file
      : file?.files
        ? file.files[0]
        : file;

    if (!fileObj || !(fileObj instanceof File)) {
      this.swaCustomService.swaMsgInfo('Archivo inválido.');
      return;
    }

    if (fileObj.size === 0) {
      this.swaCustomService.swaMsgInfo('El archivo está vacío.');
      return;
    }

    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];

        if (!firstSheetName) {
          this.swaCustomService.swaMsgInfo('El archivo no contiene hojas.');
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];

        const columns = this.getExcelColumns();
        const headers = this.getExcelHeaders(worksheet);

        if (!this.validateExcelHeaders(headers, columns)) {
          return;
        }

        const rows: any[] = XLSX.utils.sheet_to_json(worksheet, {
          defval: null
        });

        if (!rows || rows.length === 0) {
          this.swaCustomService.swaMsgInfo('El archivo no contiene datos para procesar.');
          return;
        }

        const articulos = this.mapExcelRowsToArticulos(rows, columns);

        if (!articulos) {
          return;
        }

        this.modelo = articulos;

        this.swaCustomService.swaMsgExito(`Archivo procesado. Filas: ${this.modelo.length}`);

      } catch (e: any) {
        this.utilService.handleErrorSingle(e, 'onClickUpload', this.swaCustomService);
      }
    };

    reader.onerror = (e) => {
      this.utilService.handleErrorSingle(e, 'onClickUpload', this.swaCustomService);
    };

    reader.readAsArrayBuffer(fileObj);
  }

  private getExcelColumns(): { field: string; aliases: string[] }[] {
    return [
      { field: 'itemCode', aliases: ['itemCode', 'Codigo'] },
      { field: 'itemName', aliases: ['itemName', 'Nombre'] },
      { field: 'itmsGrpCod', aliases: ['itmsGrpCod', 'Grupo'] },
      { field: 'salUnitMsr', aliases: ['salUnitMsr', 'UM de venta'] },
      { field: 'buyUnitMsr', aliases: ['buyUnitMsr', 'UM de compra'] },
      { field: 'invntryUom', aliases: ['invntryUom', 'UM de inventario'] },
      { field: 'u_BPP_TIPEXIST', aliases: ['u_BPP_TIPEXIST', 'Tipo existencia'] },
      { field: 'u_BPP_TIPUNMED', aliases: ['u_BPP_TIPUNMED', 'Tipo unidad de medida'] },
      { field: 'u_S_PartAranc1', aliases: ['u_S_PartAranc1', 'Partida arancelaria'] },
      { field: 'u_S_PartAranc2', aliases: ['u_S_PartAranc2', 'Partida arancelaria colombia'] },
      { field: 'u_FIB_ECU', aliases: ['u_FIB_ECU', 'Partida arancelaria ecuador'] },
      { field: 'u_S_CCosto', aliases: ['u_S_CCosto', 'Centro costo articulo'] },
      { field: 'u_FIB_PESO', aliases: ['u_FIB_PESO', 'Peso item'] },
      { field: 'u_FIB_SGRUP', aliases: ['u_FIB_SGRUP', 'Sub grupo'] },
      { field: 'u_FIB_SGRUPO2', aliases: ['u_FIB_SGRUPO2', 'Sub grupo 2'] },
      { field: 'u_FIB_LINNEG', aliases: ['u_FIB_LINNEG', 'Linea de negocio'] }
    ];
  }

  private getExcelHeaders(worksheet: XLSX.WorkSheet): string[] {
    return (XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: ''
    })[0] as any[] || []).map(x => x?.toString().trim());
  }

  private validateExcelHeaders(headers: string[], columns: { field: string; aliases: string[] }[]): boolean {
    const validHeaders = columns.flatMap(x => x.aliases);

    if (headers.length !== columns.length) {
      this.swaCustomService.swaMsgInfo('El formato del archivo no es correcto. La cantidad de columnas no coincide.');
      return false;
    }

    const invalidHeader = headers.find(h => !validHeaders.includes(h));

    if (invalidHeader) {
      this.swaCustomService.swaMsgInfo(`El formato del archivo no es correcto. La columna '${invalidHeader}' no es válida.`);
      return false;
    }

    const missingColumn = columns.find(c => !headers.some(h => c.aliases.includes(h)));

    if (missingColumn) {
      this.swaCustomService.swaMsgInfo(`El formato del archivo no es correcto. Falta la columna '${missingColumn.aliases[1]}'.`);
      return false;
    }

    return true;
  }

  private mapExcelRowsToArticulos(rows: any[], columns: { field: string; aliases: string[] }[]): IArticulo[] | null {
    const articulos: IArticulo[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] || {};
      const nroLinea = i + 1;

      const m = this.mapExcelRow(row, columns);
      const articulo = this.buildExcelArticulo(m);

      if (!this.validateExcelArticulo(articulo, nroLinea)) {
        return null;
      }

      articulos.push(articulo as IArticulo);
    }

    return articulos;
  }

  private mapExcelRow(row: any, columns: { field: string; aliases: string[] }[]): any {
    const m: any = {};

    columns.forEach(c => {
      m[c.field] = this.pickExcelValue(row, c.aliases);
    });

    return m;
  }

  private pickExcelValue(row: any, aliases: string[]): any {
    for (const a of aliases) {
      if (a in row && row[a] !== null && row[a] !== undefined) {
        return row[a];
      }
    }

    return null;
  }

  private buildExcelArticulo(m: any): IArticulo {
    return {
      itemCode       : (m.itemCode ?? '').toString().trim(),
      itemName       : (m.itemName ?? '').toString().trim(),
      itmsGrpCod     : m.itmsGrpCod !== null ? Number(m.itmsGrpCod) : null,
      salUnitMsr     : (m.salUnitMsr ?? '').toString().trim(),
      buyUnitMsr     : (m.buyUnitMsr ?? '').toString().trim(),
      invntryUom     : (m.invntryUom ?? '').toString().trim(),
      u_BPP_TIPEXIST : (m.u_BPP_TIPEXIST ?? '').toString().trim(),
      u_BPP_TIPUNMED : (m.u_BPP_TIPUNMED ?? '').toString().trim(),
      u_S_PartAranc1 : (m.u_S_PartAranc1 ?? '').toString().trim(),
      u_S_PartAranc2 : (m.u_S_PartAranc2 ?? '').toString().trim(),
      u_FIB_ECU      : (m.u_FIB_ECU ?? '').toString().trim(),
      u_S_CCosto     : (m.u_S_CCosto ?? '').toString().trim(),
      u_FIB_PESO     : m.u_FIB_PESO !== null ? Number(m.u_FIB_PESO) : 0,
      u_FIB_SGRUP    : (m.u_FIB_SGRUP ?? '').toString().trim(),
      u_FIB_SGRUPO2  : (m.u_FIB_SGRUPO2 ?? '').toString().trim(),
      u_FIB_LINNEG   : (m.u_FIB_LINNEG ?? '').toString().trim()
    } as IArticulo;
  }

  private validateExcelArticulo(articulo: IArticulo, nroLinea: number): boolean {
    const validations = [
      {
        cond: !articulo.itemCode,
        msg: `Línea ${nroLinea}: Ingrese el código de artículo.`
      }
    ];

    const error = validations.find(x => x.cond);

    if (error) {
      this.swaCustomService.swaMsgInfo(error.msg);
      return false;
    }

    return true;
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

  private save(): void {
    this.isSaving = true;

    if (!this.onValidatedSave()) {
      this.isSaving = false;
      return;
    }

    const modeloToSave = this.mapArticulosUpdate();

    this.itemsService.setUpdateMassive(modeloToSave)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSaving = false)
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

  private onValidatedSave(): boolean {
    const validations = [
      {
        cond: !this.modelo || this.modelo.length === 0,
        msg: 'No existen líneas para procesar.'
      }
    ];

    const error = validations.find(x => x.cond);

    if (error) {
      this.swaCustomService.swaMsgInfo(error.msg);
      return false;
    }

    return true;
  }

  private mapArticulosUpdate(): ArticuloUpdateModel[] {
    /** helpers para evitar repetición */
    const u = this.utilService;

    const p = (v: any) => u.normalizePrimitive(v);
    const n = (v: any) => u.normalizeNumber(v);

    const userId = this.userContextService.getIdUsuario();

    return (this.modelo || []).map(line => ({
      itemCode       : p(line.itemCode),
      itemName       : p(line.itemName),

      itmsGrpCod     : n(line.itmsGrpCod),

      salUnitMsr     : p(line.salUnitMsr),
      buyUnitMsr     : p(line.buyUnitMsr),
      invntryUom     : p(line.invntryUom),

      u_BPP_TIPEXIST : p(line.u_BPP_TIPEXIST),
      u_BPP_TIPUNMED : p(line.u_BPP_TIPUNMED),

      u_S_PartAranc1 : p(line.u_S_PartAranc1),
      u_S_PartAranc2 : p(line.u_S_PartAranc2),
      u_FIB_ECU      : p(line.u_FIB_ECU),

      u_S_CCosto     : p(line.u_S_CCosto),

      u_FIB_PESO     : n(line.u_FIB_PESO),

      u_FIB_SGRUP    : p(line.u_FIB_SGRUP),
      u_FIB_SGRUPO2  : p(line.u_FIB_SGRUPO2),
      u_FIB_LINNEG   : p(line.u_FIB_LINNEG),

      u_UsrUpdate    : userId
    }));
  }
}
