import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicBalance } from './public-balance';

describe('PublicBalance', () => {
  let component: PublicBalance;
  let fixture: ComponentFixture<PublicBalance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicBalance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicBalance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
