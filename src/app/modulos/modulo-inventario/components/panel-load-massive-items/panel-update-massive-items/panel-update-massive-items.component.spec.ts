import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelUpdateMassiveItemsComponent } from './panel-update-massive-items.component';

describe('PanelUpdateMassiveItemsComponent', () => {
  let component: PanelUpdateMassiveItemsComponent;
  let fixture: ComponentFixture<PanelUpdateMassiveItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelUpdateMassiveItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelUpdateMassiveItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
