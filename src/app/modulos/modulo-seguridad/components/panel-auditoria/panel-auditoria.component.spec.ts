import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelAuditoriaComponent } from './panel-auditoria.component';

describe('PanelAuditoriaComponent', () => {
  let component: PanelAuditoriaComponent;
  let fixture: ComponentFixture<PanelAuditoriaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelAuditoriaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelAuditoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
