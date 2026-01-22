import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelPanelTransferenciaStockEditComponent } from './panel-transferencia-stock-edit.component';

describe('PanelPanelTransferenciaStockEditComponent', () => {
  let component: PanelPanelTransferenciaStockEditComponent;
  let fixture: ComponentFixture<PanelPanelTransferenciaStockEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelPanelTransferenciaStockEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelPanelTransferenciaStockEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should edit', () => {
    expect(component).toBeTruthy();
  });
});
