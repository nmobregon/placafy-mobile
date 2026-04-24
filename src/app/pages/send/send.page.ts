import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonTextarea, IonInput, IonSpinner,
  IonNote, IonButtons,
  ToastController,
} from '@ionic/angular/standalone';
import { MessageService } from '../../services/message.service';
import { PlateValidationService } from '../../services/plate-validation.service';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'app-send',
  imports: [
    FormsModule, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonTextarea, IonInput, IonSpinner,
    IonNote, IonButtons,
  ],
  templateUrl: 'send.page.html',
  styleUrls: ['send.page.scss'],
})
export class SendPage {
  private messageService = inject(MessageService);
  private toastController = inject(ToastController);
  protected plateService = inject(PlateValidationService);
  protected i18n = inject(I18nService);

  plateNumber = signal('');
  senderName = signal('');
  messageText = signal('');
  sending = signal(false);
  plateTouched = signal(false);
  recommendedMessages = signal<string[]>([]);
  recommendationsLoading = signal(true);

  plateValidation = computed(() => this.plateService.validate(this.plateNumber()));
  canSend = computed(() => {
    const plateOk = this.plateValidation().valid;
    const messageOk = this.messageText().trim().length >= 1;
    return plateOk && messageOk;
  });
  showPlateError = computed(() =>
    this.plateTouched() && this.plateNumber().trim().length > 0 && !this.plateValidation().valid
  );

  constructor() {
    this.loadRecommendedMessages();
  }

  onCountryChange(event: CustomEvent) {
    this.plateService.selectCountry(event.detail.value);
  }

  onPlateInput(value: string | number | null | undefined) {
    const sanitized = String(value ?? '')
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, '');
    this.plateNumber.set(sanitized);
  }

  applyRecommendation(message: string) {
    this.messageText.set(message);
  }

  private async loadRecommendedMessages() {
    this.recommendationsLoading.set(true);
    try {
      const recommendations = await this.messageService.getRecommendedMessages(4);
      this.recommendedMessages.set(recommendations);
    } finally {
      this.recommendationsLoading.set(false);
    }
  }

  async send() {
    if (!this.canSend() || this.sending()) return;
    this.sending.set(true);

    try {
      await this.messageService.sendMessage({
        plateNumber: this.plateNumber(),
        text: this.messageText(),
        senderName: this.senderName().trim() || undefined,
      });

      const toast = await this.toastController.create({
        message: this.i18n.t('send.success'),
        duration: 2000,
        position: 'top',
        color: 'success',
        icon: 'checkmark-circle-outline',
      });
      await toast.present();

      this.plateNumber.set('');
      this.senderName.set('');
      this.messageText.set('');
      this.plateTouched.set(false);
    } catch {
      const toast = await this.toastController.create({
        message: this.i18n.t('send.error'),
        duration: 2000,
        position: 'top',
        color: 'danger',
      });
      await toast.present();
    } finally {
      this.sending.set(false);
    }
  }
}
