import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/country.interfaces';
import { filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'pages-selector-page',
  standalone: false,

  templateUrl: './selector-page.component.html',
})
export class SelectorPageComponent implements OnInit {
  public myForm: FormGroup;
  public countriesByRegion: SmallCountry[] = [];
  public bordersByCountry: SmallCountry[] = [];

  constructor(
    private fb: FormBuilder,
    private countriesService: CountriesService
  ) {
    this.myForm = this.fb.group({
      region: ['', Validators.required],
      country: ['', [Validators.required]],
      border: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.onRegionChange();
    this.onCountryChange();
  }

  public get regions(): Region[] {
    return this.countriesService.regions;
  }

  public onRegionChange(): void {
    this.myForm
      .get('region')!
      .valueChanges.pipe(
        tap(() => this.myForm.get('country')!.setValue('')),
        tap(() => this.myForm.get('border')!.setValue('')),
        switchMap((region) => this.countriesService.getCountriesByRegion(region))
      )
      .subscribe((countries) => {
        this.countriesByRegion = countries;
      });
  }

  public onCountryChange(): void {
    this.myForm
      .get('country')!
      .valueChanges.pipe(
        tap(() => this.myForm.get('border')!.setValue('')),
        filter((value: string) => value.length > 0),
        switchMap((alphaCode) =>
          this.countriesService.getCountryBordersByCode(alphaCode)
        ),
        switchMap((country) =>
          this.countriesService.getCountriesBordersByCodes(country.borders ?? [])
        )
      )
      .subscribe((borders) => {
        this.bordersByCountry = borders;
      });
  }
}
