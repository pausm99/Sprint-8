import { TestBed } from '@angular/core/testing';

import { CitypointsService } from './citypoints.service';

describe('CitypointsService', () => {
  let service: CitypointsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CitypointsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
