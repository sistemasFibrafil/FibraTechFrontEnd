import { TestBed } from '@angular/core/testing';

import { AccesoOpcionesService } from './acceso-opciones.service';

describe('AccesoOpcionesService', () => {
  let service: AccesoOpcionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccesoOpcionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
