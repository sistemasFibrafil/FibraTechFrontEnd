import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelSolicitudTrasladoCreateComponent } from './panel-solicitud-traslado-create.component';

describe('PanelSolicitudTrasladoCreateComponent', () => {
  let component: PanelSolicitudTrasladoCreateComponent;
  let fixture: ComponentFixture<PanelSolicitudTrasladoCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelSolicitudTrasladoCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelSolicitudTrasladoCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
