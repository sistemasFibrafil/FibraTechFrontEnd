import { TestBed } from '@angular/core/testing';

import { SwaCustomService } from './swa-custom.service';

describe('SwaCustomService', () => {
  let service: SwaCustomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SwaCustomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
