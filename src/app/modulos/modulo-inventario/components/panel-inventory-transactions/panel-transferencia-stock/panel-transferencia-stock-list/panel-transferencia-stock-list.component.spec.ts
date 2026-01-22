import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelPanelTransferenciaStockListComponent } from './panel-transferencia-stock-list.component';

describe('PanelPanelTransferenciaStockListComponent', () => {
  let component: PanelPanelTransferenciaStockListComponent;
  let fixture: ComponentFixture<PanelPanelTransferenciaStockListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelPanelTransferenciaStockListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelPanelTransferenciaStockListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should list', () => {
    expect(component).toBeTruthy();
  });
});
