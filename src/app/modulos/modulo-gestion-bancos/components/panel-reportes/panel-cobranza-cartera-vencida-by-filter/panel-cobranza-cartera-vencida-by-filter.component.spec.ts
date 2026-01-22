import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelCobranzaCarteraVencidaByFilterComponent } from './panel-cobranza-cartera-vencida-by-filter.component';

describe('PanelCobranzaCarteraVencidaByFilterComponent', () => {
  let component: PanelCobranzaCarteraVencidaByFilterComponent;
  let fixture: ComponentFixture<PanelCobranzaCarteraVencidaByFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelCobranzaCarteraVencidaByFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
  fixture = TestBed.createComponent(PanelCobranzaCarteraVencidaByFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
