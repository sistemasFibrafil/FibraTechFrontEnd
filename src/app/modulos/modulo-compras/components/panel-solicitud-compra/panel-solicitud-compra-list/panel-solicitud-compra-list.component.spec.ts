import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelSolicitdCompraListComponent } from './panel-solicitud-compra-list.component';

describe('PanelSolicitdCompraListComponent', () => {
  let component: PanelSolicitdCompraListComponent;
  let fixture: ComponentFixture<PanelSolicitdCompraListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelSolicitdCompraListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelSolicitdCompraListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should list', () => {
    expect(component).toBeTruthy();
  });
});
