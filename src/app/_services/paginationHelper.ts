import { HttpClient, HttpParams } from '@angular/common/http';
import { PaginationResult } from '../_modules/Pagination';
import { map } from 'rxjs';

export function getPaginationResult<T>(
  url: string,
  params: HttpParams,
  http: HttpClient
) {
  const paginationResult: PaginationResult<T> = new PaginationResult<T>();
  return http.get<T>(url, { observe: 'response', params }).pipe(
    map((response) => {
      if (response.body) {
        paginationResult.result = response.body;
      }
      const pagination = response.headers.get('pagination');
      if (pagination) {
        paginationResult.pagination = JSON.parse(pagination);
      }
      return paginationResult;
    })
  );
}

export function getPaginationHeader(
  pageNumber: number,
  pageSize: number
): HttpParams {
  let params = new HttpParams();
  params = params.append('pageNumber', pageNumber);
  params = params.append('pageSize', pageSize);
  return params;
}
