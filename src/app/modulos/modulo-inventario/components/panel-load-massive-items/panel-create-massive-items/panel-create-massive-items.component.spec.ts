import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelCreateMassiveItemsComponent } from './panel-create-massive-items.component';

describe('PanelCreateMassiveItemsComponent', () => {
  let component: PanelCreateMassiveItemsComponent;
  let fixture: ComponentFixture<PanelCreateMassiveItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelCreateMassiveItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelCreateMassiveItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
