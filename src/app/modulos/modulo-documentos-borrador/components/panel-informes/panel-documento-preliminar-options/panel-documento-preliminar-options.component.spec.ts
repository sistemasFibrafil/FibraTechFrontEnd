import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelDocumentoPreliinarOptionsComponent } from './panel-documento-preliminar-options.component';

describe('PanelDocumentoPreliinarOptionsComponent', () => {
  let component: PanelDocumentoPreliinarOptionsComponent;
  let fixture: ComponentFixture<PanelDocumentoPreliinarOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelDocumentoPreliinarOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelDocumentoPreliinarOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
