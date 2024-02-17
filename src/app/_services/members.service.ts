import {
  HttpClient,
  HttpHandler,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';
import { map, of, take } from 'rxjs';
import { PaginationResult } from '../_modules/Pagination';
import { UserParams } from '../_models/userParams';
import { AccountService } from './account.service';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  baseUrl = environment.apiUrl;
  members: Member[] = [];
  memeberCache = new Map();
  userParams: UserParams | undefined;
  user: User | undefined;

  constructor(
    private http: HttpClient,
    private accountService: AccountService
  ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: (user) => {
        if (user) {
          this.userParams = new UserParams(user);
          this.user = user;
        }
      },
    });
  }

  resetMemberCache() {
    this.memeberCache.clear();
  }

  getUserParams() {
    return this.userParams;
  }

  setUserParams(params: UserParams) {
    this.userParams = params;
  }

  resetUserParams() {
    if (this.user) {
      this.userParams = new UserParams(this.user);
      return this.userParams;
    }
    return;
  }
  getMembers(UserParams: UserParams) {
    const response = this.memeberCache.get(Object.values(UserParams).join('-'));
    if (response) return of(response);
    let params = this.getPaginationHeader(
      UserParams.pageNumber,
      UserParams.pageSize
    );

    params = params.append('minAge', UserParams.minAge);
    params = params.append('maxAge', UserParams.maxAge);
    params = params.append('gender', UserParams.gender);
    params = params.append('orderBy', UserParams.orderBy);
    //if (this.members.length > 0) return of(this.members); //cache cacheing in angular
    return this.getPaginationResult<Member[]>(
      this.baseUrl + '/users',
      params
    ).pipe(
      map((response) => {
        this.memeberCache.set(Object.values(UserParams).join('-'), response);
        return response;
      })
    );
  }

  getMember(username: string) {
    const member = [...this.memeberCache.values()]
      .reduce((arr, elem) => arr.concat(elem.result), [])
      .find((member: Member) => member.userName === username);
    if (member) return of(member);
    return this.http.get<Member>(this.baseUrl + '/users/' + username);
  }

  updateMember(member: Member) {
    return this.http.put(this.baseUrl + '/users/', member).pipe(
      map(() => {
        const index = this.members.indexOf(member);
        this.members[index] = { ...this.members[index], ...member };
      })
    );
  }
  setMainPhoto(photId: number) {
    return this.http.put(this.baseUrl + '/users/set-main-photo/' + photId, {});
  }

  deletePhoto(photoId: number) {
    return this.http.delete(this.baseUrl + '/users/delete-photo/' + photoId);
  }

  addLike(userName: string) {
    return this.http.post(this.baseUrl + '/likes/' + userName, {});
  }

  getLikes(predicates: string, pageNumber: number, pageSize: number) {
    let params = this.getPaginationHeader(pageNumber, pageSize);
    params = params.append('predicate', predicates);

    return this.getPaginationResult<Member[]>(this.baseUrl + '/likes', params);
    // this.http.get<Member[]>(this.baseUrl + '/likes/' + predicates);
  }

  private getPaginationResult<T>(url: string, params: HttpParams) {
    const paginationResult: PaginationResult<T> = new PaginationResult<T>();
    return this.http.get<T>(url, { observe: 'response', params }).pipe(
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

  private getPaginationHeader(
    pageNumber: number,
    pageSize: number
  ): HttpParams {
    let params = new HttpParams();
    params = params.append('pageNumber', pageNumber);
    params = params.append('pageSize', pageSize);
    return params;
  }
}
