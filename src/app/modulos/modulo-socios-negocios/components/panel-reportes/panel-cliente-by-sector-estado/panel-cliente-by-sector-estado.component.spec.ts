import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelClienteBySectorEstadoComponent } from './panel-cliente-by-sector-estado.component';

describe('PanelClienteBySectorEstadoComponent', () => {
  let component: PanelClienteBySectorEstadoComponent;
  let fixture: ComponentFixture<PanelClienteBySectorEstadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelClienteBySectorEstadoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelClienteBySectorEstadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
