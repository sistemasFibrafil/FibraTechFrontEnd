import { Component, OnInit } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { Subscription } from 'rxjs';
import { SwaCustomService } from 'src/app/services/swa-custom.service';

import { IVentaProyeccionByFecha } from 'src/app/modulos/modulo-ventas/interfaces/factura-venta.interface';
import { FacturaVentaService } from 'src/app/modulos/modulo-ventas/services/sap-business-one/factura-venta-sap.service';


@Component({
  selector: 'app-page-inicial',
  templateUrl: './page-inicial.component.html',
  styleUrls: ['./page-inicial.component.css']
})
export class PageInicialComponent implements OnInit {
  subscription: Subscription;
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();


  // Modal
  isDisplay: boolean = false;
  isDashboard: boolean = false;


  data02: any;
  chartOpciones02:any;
  isDisplayUp: boolean = false;

  totalVentaMesAnioAnterior: number = 0;
  totalCuotaMesAnioAnterior: number = 0;
  totalVariacionMesAnioAnterior: number = 0;
  totalAvanceMesAnioAnterior: number = 0;

  totalVentaAnioAnterior: number = 0;
  totalCuotaAnioAnterior: number = 0;
  totalVariacionAnioAnterior: number = 0;
  totalAvanceAnioAnterior: number = 0;

  totalVentaMesAnterior: number = 0;
  totalCuotaMesAnterior: number = 0;
  totalVariacionMesAnterior: number = 0;
  totalAvanceMesAnterior: number = 0;

  totalVentaMesActual: number = 0;
  totalCuotaMesActual: number = 0;
  totalVariacionMesActual: number = 0;
  totalAvanceMesActual: number = 0;

  totalVentaAnioActual: number = 0;
  totalCuotaAnioActual: number = 0;
  totalVariacionAnioActual: number = 0;
  totalAvanceAnioActual: number = 0;


  lista: IVentaProyeccionByFecha[];

  constructor(
    private readonly swaCustomService: SwaCustomService,
    private facturaVentaService: FacturaVentaService) { }

  ngOnInit(): void {
    this.onListar();
  }

  onListar() {
    this.isDisplay = true;
    this.lista = [];
    var param: any = { dat1: new Date(new Date().getFullYear(), new Date().getMonth(), 1), dat2: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0) };
    this.facturaVentaService.getListVentaProyeccionByFecha(param)
    .subscribe({next:(data: IVentaProyeccionByFecha[]) =>
    {
      this.lista = data;
      this.lista.forEach(item => {
        this.totalVentaMesAnioAnterior += item.ventaMesAnioAnterior || 0;
        this.totalCuotaMesAnioAnterior += item.cuotaMesAnioAnterior || 0;

        this.totalVentaAnioAnterior += item.ventaAnioAnterior || 0;
        this.totalCuotaAnioAnterior += item.cuotaAnioAnterior || 0;

        this.totalVentaMesAnterior += item.ventaMesAnterior || 0;
        this.totalCuotaMesAnterior += item.cuotaMesAnterior || 0;

        this.totalVentaMesActual += item.ventaMesActual || 0;
        this.totalCuotaMesActual += item.cuotaMesActual || 0;

        this.totalVentaAnioActual += item.ventaAnioActual || 0;
        this.totalCuotaAnioActual += item.cuotaAnioActual || 0;
      });

      this.totalVariacionMesAnioAnterior = (this.totalVentaMesAnioAnterior - this.totalCuotaMesAnioAnterior) || 0;
      this.totalAvanceMesAnioAnterior = this.totalCuotaMesAnioAnterior === 0 ? 0 : (this.totalVentaMesAnioAnterior/this.totalCuotaMesAnioAnterior) || 0;

      this.totalVariacionAnioAnterior = (this.totalVentaAnioAnterior - this.totalCuotaAnioAnterior) || 0;
      this.totalAvanceAnioAnterior = this.totalCuotaAnioAnterior === 0 ? 0 : (this.totalVentaAnioAnterior/this.totalCuotaAnioAnterior) || 0;

      this.totalVariacionMesAnterior = (this.totalVentaMesAnterior - this.totalCuotaMesAnterior) || 0;
      this.totalAvanceMesAnterior = this.totalCuotaMesAnterior === 0 ? 0 : (this.totalVentaMesAnterior/this.totalCuotaMesAnterior) || 0;

      this.totalVariacionMesActual = (this.totalVentaMesActual - this.totalCuotaMesActual) || 0;
      this.totalAvanceMesActual = this.totalCuotaMesActual === 0 ? 0 : (this.totalVentaMesActual/this.totalCuotaMesActual) || 0;

      this.totalVariacionAnioActual = (this.totalVentaAnioActual - this.totalCuotaAnioActual) || 0;
      this.totalAvanceAnioActual = this.totalCuotaAnioActual === 0 ? 0 : (this.totalVentaAnioActual/this.totalCuotaAnioActual) || 0;

      this.isDisplay = false;
      this.isDashboard = true;
    },error:(e)=>{
      this.isDisplay = false;
      this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
    }
    });
  }
}
