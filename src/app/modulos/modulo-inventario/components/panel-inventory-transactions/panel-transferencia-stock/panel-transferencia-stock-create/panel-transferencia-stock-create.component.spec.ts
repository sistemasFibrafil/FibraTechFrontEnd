import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelPanelTransferenciaStockCreateComponent } from './panel-transferencia-stock-create.component';

describe('PanelPanelTransferenciaStockCreate2Component', () => {
  let component: PanelPanelTransferenciaStockCreateComponent;
  let fixture: ComponentFixture<PanelPanelTransferenciaStockCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelPanelTransferenciaStockCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelPanelTransferenciaStockCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
