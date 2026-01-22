import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelSolicitudCompraEditComponent } from './panel-solicitud-compra-edit.component';

describe('PanelSolicitudCompraEditComponent', () => {
  let component: PanelSolicitudCompraEditComponent;
  let fixture: ComponentFixture<PanelSolicitudCompraEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelSolicitudCompraEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelSolicitudCompraEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should edit', () => {
    expect(component).toBeTruthy();
  });
});
