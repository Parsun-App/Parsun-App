import { TranslatePipe } from '@core/i18n/translate.pipe';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  model,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CashRegisterApplicationService } from '@features/finance/treasury/cash-register/services/application/cash-register-application.service';

import { CancelButtonComponent } from '@shared/components/ui/cancel-button/cancel-button.component';
@Component({
  selector: 'app-cash-register-open-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CancelButtonComponent,
    TranslatePipe,
    PermissionDirective,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
  ],
  templateUrl: './cash-register-open-dialog.component.html',
})
export class CashRegisterOpenDialogComponent {
  readonly visible = model(false);

  private readonly service = inject(CashRegisterApplicationService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly isSubmitting = signal(false);

  readonly openForm = this.formBuilder.group({
    openedByName: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      if (!this.visible()) return;
      this.openForm.reset({
        openedByName: this.service.currentUserName(),
      });
    });
  }

  submit(): void {
    if (this.openForm.invalid) return;

    const openedByName = this.openForm.get('openedByName')?.value ?? '';

    this.isSubmitting.set(true);
    this.service
      .openRegister(openedByName)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          if (!result) return;
          this.visible.set(false);
          this.openForm.reset();
        },
      });
  }
}
