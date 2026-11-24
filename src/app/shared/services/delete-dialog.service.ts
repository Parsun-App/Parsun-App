import { Injectable, Injector, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TranslationService } from '@core/i18n/translation.service';
import { DeleteHandlerRegistration, DELETE_HANDLERS } from '@shared/services/delete-handlers.token';

export interface DeleteRequest {
  resource: string;
  id: string;
  label: string;
}

@Injectable({ providedIn: 'root' })
export class DeleteDialogService {
  private readonly handlers = inject(DELETE_HANDLERS);
  private readonly injector = inject(Injector);
  readonly request = signal<DeleteRequest | null>(null);
  readonly loading = signal(false);
  private success: (() => void) | undefined;

  open(resource: string, id: string, label: string, success?: () => void): void {
    this.success = success;
    this.request.set({ resource, id, label: this.cleanLabel(label) });
  }

  private cleanLabel(label: string): string {
    return label.replace(/[$«»]/g, '').trim();
  }

  close(): void {
    if (!this.loading()) this.request.set(null);
  }

  confirm(): void {
    const request = this.request();
    if (!request || this.loading()) return;

    const handler: DeleteHandlerRegistration | undefined = this.handlers.find(
      (item) => item.resource === request.resource,
    );

    if (!handler) {
      this.showError('common.delete.missingHandler');
      return;
    }

    this.loading.set(true);
    handler.execute(request.id).subscribe({
      next: () => {
        this.loading.set(false);
        this.request.set(null);
        this.success?.();
        this.success = undefined;
        this.messages?.add({
          severity: 'success',
          summary: this.t('common.delete.title'),
          detail: this.t('common.delete.success', { label: request.label }),
          life: 3000,
        });
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.messages?.add({
          severity: 'error',
          summary: this.t('common.delete.title'),
          detail: this.errorMessage(error),
          life: 5000,
        });
      },
    });
  }

  private get messages(): MessageService | null {
    return this.injector.get(MessageService, null);
  }

  private t(key: string, parameters?: Record<string, string | number | null | undefined>): string {
    return this.injector.get(TranslationService, null)?.t(key, parameters) ?? key;
  }

  private showError(key: string): void {
    this.messages?.add({
      severity: 'error',
      summary: this.t('common.delete.title'),
      detail: this.t(key),
      life: 5000,
    });
  }

  private errorMessage(error: unknown): string {
    const details = this.errorDetails(error);
    if (!details) return this.t('common.delete.error');
    if (this.status(error) === 409 && typeof details['error'] === 'string' && details['error']) {
      return details['error'];
    }
    if (typeof details['message'] === 'string' && details['message']) {
      return details['message'];
    }
    if (typeof details['error'] === 'string' && details['error']) {
      return details['error'];
    }
    return this.t('common.delete.error');
  }

  private errorDetails(error: unknown): Record<string, unknown> | null {
    if (typeof error !== 'object' || error === null || !('error' in error)) return null;
    const details = (error as { error?: unknown }).error;
    return typeof details === 'object' && details !== null
      ? (details as Record<string, unknown>)
      : null;
  }

  private status(error: unknown): number | undefined {
    if (typeof error !== 'object' || error === null || !('status' in error)) return undefined;
    const status = (error as { status?: unknown }).status;
    return typeof status === 'number' ? status : undefined;
  }
}
