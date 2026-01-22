import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelOrdenVentaSodimacOrienteByFechaNumeroComponent } from './panel-ov-sodimac-oriente-by-fecha-numero.component';

describe('PanelOrdenVentaSodimacOrienteByFechaNumeroComponent', () => {
  let component: PanelOrdenVentaSodimacOrienteByFechaNumeroComponent;
  let fixture: ComponentFixture<PanelOrdenVentaSodimacOrienteByFechaNumeroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelOrdenVentaSodimacOrienteByFechaNumeroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelOrdenVentaSodimacOrienteByFechaNumeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
