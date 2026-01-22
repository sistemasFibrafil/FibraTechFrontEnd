import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenMantenimientoWebCreateComponent } from './om-web-create.component';

describe('PersonaCreateComponent', () => {
  let component: OrdenMantenimientoWebCreateComponent;
  let fixture: ComponentFixture<OrdenMantenimientoWebCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrdenMantenimientoWebCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdenMantenimientoWebCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
