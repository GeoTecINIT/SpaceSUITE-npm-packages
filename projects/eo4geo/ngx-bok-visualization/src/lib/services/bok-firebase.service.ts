import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, concatMap, filter, forkJoin, from, map, Observable, of, take, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BokFirebaseService {
  private bokMap = new Map<string, any>();
  private versionsMap$ = new BehaviorSubject<Map<string, any> | undefined>(undefined);
  private currentVersion$ = new BehaviorSubject<string | undefined>(undefined);  
  private URL_BASE: string | undefined;

  constructor(private http: HttpClient ) {
    this.URL_BASE = environment.URL_ARRAY[0];
  }

  // Function to get the BOK data for a specific version from Firebase
  getBokVersion(version: string): Observable<any> {
    return this.getCurrentVersion().pipe(
      concatMap((currentVersion) => {
        const queryVersion = version === `v${currentVersion}` ? 'current' : version;

        if (this.bokMap.has(queryVersion)) {
          return of(this.bokMap.get(queryVersion));
        }

        const versionUrl = `${queryVersion}.json`;
        return this.getDataFromFirebase(versionUrl).pipe(
          tap((bok) => {
            this.bokMap.set(queryVersion, bok);
          })
        );
      })
    );
  }

  // Function to get a map with old versions (key) and their release year (value)
  getOldVersionsData(): Observable<Map<string, number> | undefined> {
    if (this.versionsMap$.value == undefined || this.versionsMap$.value.size == 0) {
      const versionsUrl = '.json?shallow=true';

      this.getDataFromFirebase(versionsUrl).pipe(
        concatMap((versionsObject) =>
          this.getCurrentVersion().pipe(
            filter((currentVersion) => currentVersion !== undefined),
            map((currentVersion) => {
              versionsObject[`v${currentVersion}`] = versionsObject['current'];
              delete versionsObject['current'];
              return Object.keys(versionsObject);
            })
          )
        ),
        concatMap((versionsArray) => {
          const requests = versionsArray.map((key) => {
            let dateUrl = `${key}/creationYear.json`;
            if (key === `v${this.currentVersion$.value}`) dateUrl = `current/creationYear.json`;
            return this.getDataFromFirebase(dateUrl).pipe(
              map((creationYear: number) => ({ key, creationYear }))
            );
          });
          return forkJoin(requests).pipe(
            map((results) => {
              const newMap: Map<string, number> = new Map<string, number>();
              results.forEach(({ key, creationYear }) => {
                newMap.set(key, creationYear);
              });
              return newMap;
            })
          );
        }),
        tap((map) => this.versionsMap$.next(map)),
        catchError((error) => {
          console.error('Error fetching old versions data:', error);
          this.versionsMap$.error(error)
          return of(undefined);
        })
      ).subscribe();
    }
    return this.versionsMap$.asObservable();
  }

  // Function to check which is the first working URL and set it as URL_BASE
  private checkUrls(): Observable<boolean> {
    return from(environment.URL_ARRAY).pipe(
      concatMap((url) => 
        this.getDataFromFirebase('current/version.json').pipe(
          tap((version: string) => {
            this.URL_BASE = url;
          }),
          catchError(() => of(null))
        )
      ),
      take(1),
      map((result) => result !== null)
    );
  }

  // Function to get the current version of the BOK from Firebase
  private getCurrentVersion(): Observable<string | undefined> {
    if (!this.currentVersion$.value) {
        const currentVersionUrl = 'current/version.json';
        this.getDataFromFirebase(currentVersionUrl).pipe(
            tap((version: string) => {
                this.currentVersion$.next(version);
            }),
            catchError((error) => {
                this.currentVersion$.error(error);
                return of(undefined);
            })
        ).subscribe();
    }
    return this.currentVersion$.asObservable();
  }

  // Function to fetch data from Firebase given a URL
  private getDataFromFirebase(url: string): Observable<any> {
    if (!this.URL_BASE) {
      throw new Error('URL_BASE is not set');
    }

    const fullUrl = `${this.URL_BASE}${url}`;
    return this.http.get<any>(fullUrl).pipe(
      catchError((error) => {
        console.error('There was a problem with the HTTP request:', error);
        return this.checkUrls().pipe(  // Aquí intentamos obtener una URL válida si falla
          concatMap((isValidUrl) => {
            if (isValidUrl) return this.getDataFromFirebase(url);
            else throw error;
          })
        );
      })
    );
  }

  public checkConcept(conceptCode: string, bokversion: string) {
    return this.http.get<string>(environment.API_URL + bokversion + '/concepts/' + conceptCode + '/id.json');
  }
}
