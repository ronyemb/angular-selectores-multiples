import { Injectable } from '@angular/core';
import {
  Country,
  Region,
  SmallCountry,
} from '../interfaces/country.interfaces';
import { catchError, combineLatest, map, Observable, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CountriesService {
  private baseURL: string = 'https://restcountries.com/v3.1';
  private _regions: Region[] = [
    Region.Africa,
    Region.Americas,
    Region.Asia,
    Region.Europe,
    Region.Oceania,
  ];
  private _countries: SmallCountry[] = [];

  constructor(private http: HttpClient) {}

  get regions(): Region[] {
    return [...this._regions];
  }

  public getCountriesByRegion(region: Region): Observable<SmallCountry[]> {
    if (!region) return of([]);

    const url = `${this.baseURL}/region/${region}?fields=cca3,name,borders`;
    return this.http.get<Country[]>(url).pipe(
      map(
        (countries) =>
          countries.map((country) => ({
            name: country.name.common,
            cca3: country.cca3,
            borders: country.borders ?? [],
          })),
        tap((response) => console.log({ response }))
      )
    );
  }

  public getCountryBordersByCode(alphaCode: string): Observable<SmallCountry> {
    const url = `${this.baseURL}/alpha/${alphaCode}?fields=name,cca3,borders`;
    return this.http.get<Country>(url).pipe(
      map((country) => ({
        name: country.name.common,
        cca3: country.cca3,
        borders: country.borders ?? [],
      })),
      catchError((error) => {
        console.error(error);
        return of({ name: '', cca3: '', borders: [] });
      })
    );
  }

  public getCountriesBordersByCodes(borders: string[]): Observable<SmallCountry[]> {
    if (!borders || borders.length === 0) return of([]);
    const countriesRequest: Observable<SmallCountry>[] = [];
    borders.forEach((border) => {
      countriesRequest.push(this.getCountryBordersByCode(border).pipe(
        map((country) => ({
          ...country,
          borders: country.borders ?? [], // Asegurarse de que borders nunca sea undefined
        })),
        catchError((error) => {
          console.error(error);
          return of({ name: '', cca3: '', borders: [] });
        })
      ));
    });
    return combineLatest(countriesRequest);
  }

}
