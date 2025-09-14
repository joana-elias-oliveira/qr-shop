import { HttpInterceptorFn } from '@angular/common/http';

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  const apiKey = localStorage.getItem('apiKey');
  if (apiKey) {
    req = req.clone({ setHeaders: { apiKey } });
  }
  return next(req);
};
