import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelTakeInventorySparePartsCreateComponent } from './panel-spare-parts-create.component';

describe('PanelTakeInventorySparePartsCreateComponent', () => {
  let component: PanelTakeInventorySparePartsCreateComponent;
  let fixture: ComponentFixture<PanelTakeInventorySparePartsCreateComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelTakeInventorySparePartsCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelTakeInventorySparePartsCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
