import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelCargaMasivaArticuloComponent } from './panel-carga-masiva-articulo.component';

describe('PanelCargaMasivaArticuloComponent', () => {
  let component: PanelCargaMasivaArticuloComponent;
  let fixture: ComponentFixture<PanelCargaMasivaArticuloComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelCargaMasivaArticuloComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelCargaMasivaArticuloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
