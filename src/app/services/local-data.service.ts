import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalDataService {

  constructor
  (
  ) { }

  getListReqTypes() : any[] {
    return [
      { code: 12, name: 'Usuario' },
      { code: 17, name: 'Empleado' },
    ]
  }

  getListDocTypes() : any[] {
    return [
      { code: 'I', name: 'Artículo' },
      { code: 'S', name: 'Servicio' },
    ]
  }

  getListStatusDocumentInventory() : any[] {
    return [
      { code: 'O', name: 'Abierto' },
      { code: 'C', name: 'Cerrado' },
    ]
  }

  getListStatusBusinessPartners() : any[] {
    return [
      { code: 'Y', name: 'Activo' },
      { code: 'N', name: 'Inactivo' },
    ]
  }

  getListTypeDocumentPicking() : any[] {
    return [
      { code: '1250000001',   name: 'Solicitud de Traslado' },
      { code: '17',           name: 'Órden de Venta' },
      { code: '13',           name: 'Factura de Reserva' },
    ]
  }

  getListTypeMovimiento() : any[] {
    return [
      { code: '01', name: 'Salida x ventas' },
      { code: '02', name: 'Salida x inventario' },
      { code: '03', name: 'Salida x producción' },
      { code: '04', name: 'Entrada x compras' },
      { code: '05', name: 'Entrada x inventario' },
      { code: '06', name: 'Entrada x producción' },
      { code: '07', name: 'Transferencia entre almacenes' }
    ]
  }
}
