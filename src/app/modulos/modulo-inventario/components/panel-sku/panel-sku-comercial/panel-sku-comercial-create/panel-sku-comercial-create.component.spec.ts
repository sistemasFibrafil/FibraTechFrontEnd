import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelSkuComercialCreateComponent } from './panel-sku-comercial-create.component';

describe('PanelSkuComercialCreateComponent', () => {
  let component: PanelSkuComercialCreateComponent;
  let fixture: ComponentFixture<PanelSkuComercialCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelSkuComercialCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelSkuComercialCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
