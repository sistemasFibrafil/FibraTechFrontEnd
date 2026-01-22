import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelSkuComercialUpdateComponent } from './panel-sku-comercial-update.component';

describe('PanelSkuComercialUpdateComponent', () => {
  let component: PanelSkuComercialUpdateComponent;
  let fixture: ComponentFixture<PanelSkuComercialUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelSkuComercialUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelSkuComercialUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
