import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TakeInventoryFinishedProductsListComponent } from './panel-finished-produts-list.component';

describe('TakeInventoryFinishedProductsListComponent', () => {
  let component: TakeInventoryFinishedProductsListComponent;
  let fixture: ComponentFixture<TakeInventoryFinishedProductsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TakeInventoryFinishedProductsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TakeInventoryFinishedProductsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
