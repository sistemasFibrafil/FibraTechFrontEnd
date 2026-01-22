import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelEntregaCreateComponent } from './panel-entrega-create.component';

describe('PanelVenEntregaCreateComponent', () => {
  let component: PanelEntregaCreateComponent;
  let fixture: ComponentFixture<PanelEntregaCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelEntregaCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelEntregaCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
