import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { CustomerApplicationService } from '@features/partners/customers/services/application/customer-application.service';

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 100;
const UPPERCASE_PATTERN = /[A-Z]/;
const LOWERCASE_PATTERN = /[a-z]/;
const DIGIT_PATTERN = /[0-9]/;
const SPECIAL_CHAR_PATTERN = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

@Component({
  selector: 'app-change-portal-password-dialog',
  standalone: true,
  imports: [FormsModule, ButtonModule, DialogModule, InputTextModule, TranslatePipe],
  templateUrl: './change-portal-password-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePortalPasswordDialogComponent {
  private readonly service = inject(CustomerApplicationService);
  private readonly messageService = inject(MessageService);

  readonly customerId = input.required<string>();
  readonly customerName = input.required<string>();
  readonly customerRif = input.required<string>();
  readonly visible = input.required<boolean>();
  readonly visibleChange = output<boolean>();
  readonly changed = output<void>();

  readonly newPassword = signal('');
  readonly confirmPassword = signal('');
  readonly loading = signal(false);
  readonly passwordTouched = signal(false);
  readonly confirmPasswordTouched = signal(false);

  readonly passwordError = computed(() => {
    const value = this.newPassword();
    if (!value) return 'partners.customers.portal.passwordRequired';
    if (value === this.customerRif()) return '';
    if (value.length < PASSWORD_MIN_LENGTH) {
      return 'partners.customers.portal.passwordMinLength';
    }
    if (value.length > PASSWORD_MAX_LENGTH) {
      return 'partners.customers.portal.passwordMaxLength';
    }
    if (!UPPERCASE_PATTERN.test(value)) {
      return 'partners.customers.portal.passwordUppercase';
    }
    if (!LOWERCASE_PATTERN.test(value)) {
      return 'partners.customers.portal.passwordLowercase';
    }
    if (!DIGIT_PATTERN.test(value)) return 'partners.customers.portal.passwordDigit';
    if (!SPECIAL_CHAR_PATTERN.test(value)) {
      return 'partners.customers.portal.passwordSpecial';
    }
    return '';
  });

  readonly confirmPasswordError = computed(() => {
    const confirm = this.confirmPassword();
    if (!confirm) return 'partners.customers.portal.confirmPasswordRequired';
    if (confirm !== this.newPassword()) {
      return 'partners.customers.portal.passwordsDoNotMatch';
    }
    return '';
  });

  readonly isValid = computed(() => !this.passwordError() && !this.confirmPasswordError());

  onSubmit(): void {
    this.passwordTouched.set(true);
    this.confirmPasswordTouched.set(true);
    if (!this.isValid()) return;

    this.loading.set(true);
    this.service.changePortalPassword(this.customerId(), this.newPassword()).subscribe({
      next: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Contraseña del portal actualizada exitosamente',
          life: 3000,
        });
        this.close();
        this.changed.emit();
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cambiar la contraseña del portal. Por favor, intente nuevamente.',
          life: 5000,
        });
      },
    });
  }

  onVisibleChange(visible: boolean): void {
    if (!visible) this.reset();
    this.visibleChange.emit(visible);
  }

  close(): void {
    this.reset();
    this.visibleChange.emit(false);
  }

  private reset(): void {
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.passwordTouched.set(false);
    this.confirmPasswordTouched.set(false);
  }
}
