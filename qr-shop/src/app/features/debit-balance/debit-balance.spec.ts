import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebitBalance } from './debit-balance';

describe('DebitBalance', () => {
  let component: DebitBalance;
  let fixture: ComponentFixture<DebitBalance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebitBalance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebitBalance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
