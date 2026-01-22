import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelPanelTransferenciaStockViewComponent } from './panel-transferencia-stock-view.component';

describe('PanelPanelTransferenciaStockViewComponent', () => {
  let component: PanelPanelTransferenciaStockViewComponent;
  let fixture: ComponentFixture<PanelPanelTransferenciaStockViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelPanelTransferenciaStockViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelPanelTransferenciaStockViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should view', () => {
    expect(component).toBeTruthy();
  });
});
