import { provideTranslatedConfirmation, provideTranslatedMessages } from '@core/i18n/translated-feedback.service';
import { languageInterceptor } from '@core/i18n/language.interceptor';
import { apiUrlInterceptor } from '@core/http/api-url.interceptor';
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { routes } from '@app/app.routes';
import { authInterceptor } from '@features/platform/auth/interceptors/auth.interceptor';
import { ParsunPreset } from '@core/theme/presets';
import { provideNavigation } from '@core/navigation/providers/provide-navigation';
import { TranslatedTitleStrategy } from '@core/i18n/translated-title.strategy';
import { TitleStrategy } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    { provide: TitleStrategy, useClass: TranslatedTitleStrategy },
    provideHttpClient(
      withFetch(),
      withInterceptors([apiUrlInterceptor, languageInterceptor, authInterceptor]),
    ),
    providePrimeNG({
      theme: {
        preset: ParsunPreset,
        options: {
          darkModeSelector: '.my-app-dark',
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng',
          },
        },
      },
    }),
    provideTranslatedMessages(),
    provideTranslatedConfirmation(),
    provideNavigation(),
    DialogService,
  ],
};
