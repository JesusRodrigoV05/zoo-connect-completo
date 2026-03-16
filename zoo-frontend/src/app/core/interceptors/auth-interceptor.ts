import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpErrorResponse,
} from "@angular/common/http";
import { AuthStore } from "../stores/auth.store";
import { inject } from "@angular/core";
import {
  Observable,
  throwError,
  BehaviorSubject,
  filter,
  take,
  switchMap,
  catchError,
  from,
  finalize,
} from "rxjs";
import { environment } from "@env";

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<
  string | null
>(null);

function resetRefreshState(): void {
  isRefreshing = false;
  refreshTokenSubject.next(null);
}

function addAuthHeader(
  request: HttpRequest<any>,
  token: string,
): HttpRequest<any> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function isAuthRoute(url: string): boolean {
  const authPaths = [
    "/auth/login",
    "/auth/register",
    "/auth/refresh",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/2fa/verify-login",
  ];
  return authPaths.some((path) => url.endsWith(path));
}

function handle401Error(
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  authStore: any,
): Observable<HttpEvent<any>> {
  if (isRefreshing) {
    return refreshTokenSubject.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap((jwt) => {
        return next(addAuthHeader(request, jwt));
      }),
      catchError((err) => {
        authStore.logoutSilently();
        return throwError(() => err);
      }),
    );
  } else {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return from(authStore.refreshTokens()).pipe(
      switchMap((response: any) => {
        const newAccessToken = response.access_token;
        refreshTokenSubject.next(newAccessToken);
        return next(addAuthHeader(request, newAccessToken));
      }),
      catchError((error: any) => {
        return throwError(() => error);
      }),
      finalize(() => {
        resetRefreshState();
      }),
    );
  }
}

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const authStore = inject(AuthStore);

  let modifiedReq = req;
  if (
    req.url.startsWith(environment.apiUrl) ||
    req.url.startsWith("/zooconnect")
  ) {
    modifiedReq = req.clone({
      withCredentials: true,
    });
  }

  if (isAuthRoute(modifiedReq.url)) {
    return next(modifiedReq);
  }

  const token = authStore.accessToken();

  if (!token) {
    return next(modifiedReq);
  }
  const reqWithAuth = addAuthHeader(modifiedReq, token);

  return next(reqWithAuth).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthRoute(reqWithAuth.url)) {
        return handle401Error(modifiedReq, next, authStore);
      }
      if (error.status === 403) {
        console.error("Forbidden request:", error);
      }
      return throwError(() => error);
    }),
  );
};
