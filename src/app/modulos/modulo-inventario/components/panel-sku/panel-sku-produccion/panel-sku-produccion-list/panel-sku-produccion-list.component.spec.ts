import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelSkuProduccionListComponent } from './panel-sku-produccion-list.component';

describe('PanelSkuProduccionListComponent', () => {
  let component: PanelSkuProduccionListComponent;
  let fixture: ComponentFixture<PanelSkuProduccionListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelSkuProduccionListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelSkuProduccionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
