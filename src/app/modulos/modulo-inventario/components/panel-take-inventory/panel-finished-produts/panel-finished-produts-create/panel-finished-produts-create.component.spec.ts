import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TakeInventoryFinishedProductsCreateComponent } from './panel-finished-produts-create.component';

describe('TakeInventoryFinishedProductsCreateComponent', () => {
  let component: TakeInventoryFinishedProductsCreateComponent;
  let fixture: ComponentFixture<TakeInventoryFinishedProductsCreateComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TakeInventoryFinishedProductsCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TakeInventoryFinishedProductsCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
