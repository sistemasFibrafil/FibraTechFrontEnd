import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonaPermisoLogisticoComponent } from './persona-permiso-logistico.component';

describe('PersonaPermisoLogisticoComponent', () => {
  let component: PersonaPermisoLogisticoComponent;
  let fixture: ComponentFixture<PersonaPermisoLogisticoComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonaPermisoLogisticoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonaPermisoLogisticoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
