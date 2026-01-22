import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelSodimacDetalladoEanViewComponent } from './panel-sodimac-detallado-ean-view.component';

describe('PanelSodimacDetalladoEanViewComponent', () => {
  let component: PanelSodimacDetalladoEanViewComponent;
  let fixture: ComponentFixture<PanelSodimacDetalladoEanViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelSodimacDetalladoEanViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelSodimacDetalladoEanViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
