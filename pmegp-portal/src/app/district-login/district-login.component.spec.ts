import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistrictLoginComponent } from './district-login.component';

describe('DistrictLoginComponent', () => {
  let component: DistrictLoginComponent;
  let fixture: ComponentFixture<DistrictLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistrictLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DistrictLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
