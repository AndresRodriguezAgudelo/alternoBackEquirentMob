/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import {
  Observable,
  TimeoutError,
  catchError,
  throwError,
  timeout,
} from "rxjs";

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(1000 * 2),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(() => err);
        }

        return throwError(() => err);
      }),
    );
  }
}
