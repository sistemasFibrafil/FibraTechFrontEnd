import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelCargaSaldoInicialListComponent } from './panel-carga-saldo-inicial-list.component';

describe('PanelCargaSaldoInicialListComponent', () => {
  let component: PanelCargaSaldoInicialListComponent;
  let fixture: ComponentFixture<PanelCargaSaldoInicialListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelCargaSaldoInicialListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelCargaSaldoInicialListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
