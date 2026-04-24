import { Injectable } from '@angular/core';
import { SelectOption } from '@app/interface/select-option.interface';

@Injectable({
  providedIn: 'root'
})
export class LocalDataService {

  constructor
  (
  ) { }

  readonly reqTypes: SelectOption[] = [
    { code: 12, name: 'Usuario' },
    { code: 17, name: 'Empleado' }
  ];


  readonly docTypes: SelectOption[] = [
    { code: 'I', name: 'Artículo' },
    { code: 'S', name: 'Servicio' }
  ];

  readonly statusDocuments: SelectOption[] = [
    { code: 'O', name: 'Abierto' },
    { code: 'C', name: 'Cerrado' }
  ];


  readonly cardType: SelectOption[] = [
    { code: 'C', name: 'Cliente' },
    { code: 'S', name: 'Proveedor' }

  ];

  readonly statusBusinessPartners: SelectOption[] = [
    { code: 'Y', name: 'Activo' },
    { code: 'N', name: 'Inactivo' }
  ];

  readonly typePicking: SelectOption[] = [
    { code: '1250000001',   name: 'Solicitud de Traslado' },
    { code: '17',           name: 'Órden de Venta' },
    { code: '13',           name: 'Factura de Reserva' },
  ];

  typeMovimiento: SelectOption[] = [
    { code: '01', name: 'Salida x ventas' },
    { code: '02', name: 'Salida x inventario' },
    { code: '03', name: 'Salida x producción' },
    { code: '04', name: 'Entrada x compras' },
    { code: '05', name: 'Entrada x inventario' },
    { code: '06', name: 'Entrada x producción' },
    { code: '07', name: 'Transferencia entre almacenes' }
  ];

  draftDate: SelectOption[] = [
    { code: '01', name: 'Fecha de creación' },
    { code: '02', name: 'Fecha de actualización' },
    { code: '03', name: 'Fecha de contabilización' },
    { code: '04', name: 'Fecha de documento' },
  ];
}
