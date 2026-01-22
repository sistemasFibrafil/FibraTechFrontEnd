import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelTakeInventorySparePartsListComponent } from './panel-spare-parts-list.component';

describe('PanelTakeInventorySparePartsListComponent', () => {
  let component: PanelTakeInventorySparePartsListComponent;
  let fixture: ComponentFixture<PanelTakeInventorySparePartsListComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelTakeInventorySparePartsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelTakeInventorySparePartsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
