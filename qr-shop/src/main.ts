import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app/app.routes';
import { Component, LOCALE_ID, DEFAULT_CURRENCY_CODE } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { apiKeyInterceptor } from './app/core/interceptors/api-key.interceptor';

// 👇 IMPORTA E REGISTRA LOCALE PT-BR
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
registerLocaleData(localePt, 'pt-BR');

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
class AppComponent {}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(
        routes,
        withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' })
    ),
    provideHttpClient(withInterceptors([apiKeyInterceptor])),

    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' },
  ],
}).catch(console.error);
