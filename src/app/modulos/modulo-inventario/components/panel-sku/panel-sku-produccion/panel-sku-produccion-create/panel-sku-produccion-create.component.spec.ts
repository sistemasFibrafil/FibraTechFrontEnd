import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelSkuProduccionCreateComponent } from './panel-sku-produccion-create.component';

describe('PanelSkuProduccionCreateComponent', () => {
  let component: PanelSkuProduccionCreateComponent;
  let fixture: ComponentFixture<PanelSkuProduccionCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelSkuProduccionCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelSkuProduccionCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
