import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelSkuComercialListComponent } from './panel-sku-comercial-list.component';

describe('PanelSkuComercialListComponent', () => {
  let component: PanelSkuComercialListComponent;
  let fixture: ComponentFixture<PanelSkuComercialListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelSkuComercialListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelSkuComercialListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
