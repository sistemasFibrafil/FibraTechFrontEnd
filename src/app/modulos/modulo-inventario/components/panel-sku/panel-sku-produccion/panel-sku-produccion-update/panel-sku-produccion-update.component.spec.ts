import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelSkuProduccionUpdateComponent } from './panel-sku-produccion-update.component';

describe('PanelSkuProduccionUpdateComponent', () => {
  let component: PanelSkuProduccionUpdateComponent;
  let fixture: ComponentFixture<PanelSkuProduccionUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelSkuProduccionUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
  fixture = TestBed.createComponent(PanelSkuProduccionUpdateComponent);
  component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
