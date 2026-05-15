import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, shareReplay, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { RequestTypes } from './requestTypes';

@Injectable()
export class GenericService {

    constructor(private http: HttpClient, private router: Router) { }

    private constructUrl(urlOptions: string): string {
        return urlOptions as string;
    }

    public Request<T>(requestType: RequestTypes, urlOptions: string, body?: any, options?: any, handler?: boolean): Observable<T> {
        if (handler === undefined) {
            handler = true;
        }

        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        let response: Observable<any>;

        if (body && options) {
            response = this.http[RequestTypes[requestType]](this.constructUrl(urlOptions), body, { headers });
        } else if (body) {
            response = this.http[RequestTypes[requestType]](this.constructUrl(urlOptions), body, { headers });
        } else {
            response = this.http[RequestTypes[requestType]](this.constructUrl(urlOptions), { headers });
        }

        if (handler === true) {
            return response.pipe(
                map((res: any) => res as T),
                shareReplay(1),
                catchError(this.handleError())
            );
        } else {
            return response.pipe(
                map((res: any) => res as T)
            );
        }
    }

    private handleError() {
        return (res: any): Observable<never> => {
            let errMessage: any;
            try {
                if (res.status === 412) {
                    console.log('error 412');
                } else if (res.status === 401) {
                    console.log('error 401');
                } else {
                    console.log('Esta en el else');
                    errMessage = res.error || res;
                }
            } catch (err) {
                errMessage = res.statusText;
            }
            return throwError(() => errMessage);
        };
    }
}

