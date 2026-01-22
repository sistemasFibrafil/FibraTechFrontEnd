import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelSolicitudCompraCreateComponent } from './panel-solicitud-compra-create.component';

describe('PanelSolicitudCompraCreateComponent', () => {
  let component: PanelSolicitudCompraCreateComponent;
  let fixture: ComponentFixture<PanelSolicitudCompraCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelSolicitudCompraCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelSolicitudCompraCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
