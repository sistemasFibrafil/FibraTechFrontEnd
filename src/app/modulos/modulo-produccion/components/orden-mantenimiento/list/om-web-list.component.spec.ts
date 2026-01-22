import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenMantenimientoWebListComponent } from './om-web-list.component';

describe('OrdenMantenimientoSapListComponent', () => {
  let component: OrdenMantenimientoWebListComponent;
  let fixture: ComponentFixture<OrdenMantenimientoWebListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrdenMantenimientoWebListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdenMantenimientoWebListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
