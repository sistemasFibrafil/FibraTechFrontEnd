import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelSocioNegociosListComponent } from './panel-socio-negocios-list.component';

describe('PanelSocioNegociosListComponent', () => {
  let component: PanelSocioNegociosListComponent;
  let fixture: ComponentFixture<PanelSocioNegociosListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelSocioNegociosListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelSocioNegociosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should list', () => {
    expect(component).toBeTruthy();
  });
});
