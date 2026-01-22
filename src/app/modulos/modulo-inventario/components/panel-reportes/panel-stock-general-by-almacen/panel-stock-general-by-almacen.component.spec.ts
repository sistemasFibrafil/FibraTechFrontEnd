import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelStockGeneralByAlmacenComponent } from './panel-stock-general-by-almacen.component';

describe('PanelStockGeneralByAlmacenComponent', () => {
  let component: PanelStockGeneralByAlmacenComponent;
  let fixture: ComponentFixture<PanelStockGeneralByAlmacenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelStockGeneralByAlmacenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelStockGeneralByAlmacenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges()
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
