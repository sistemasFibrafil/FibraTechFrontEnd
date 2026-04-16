import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonaConfigSerieDocumentoComponent } from './persona-configuracion-serie-documento.component';

describe('PersonaConfigSerieDocumentoComponent', () => {
  let component: PersonaConfigSerieDocumentoComponent;
  let fixture: ComponentFixture<PersonaConfigSerieDocumentoComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonaConfigSerieDocumentoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonaConfigSerieDocumentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
