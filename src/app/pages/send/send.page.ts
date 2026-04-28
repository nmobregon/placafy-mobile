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
  readonly plateNumberMaxLength = 14;
  readonly senderNameMaxLength = 50;
  readonly messageTextMaxLength = 300;
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
    const messageLength = this.messageText().trim().length;
    const messageOk =
      messageLength >= 1 && messageLength <= this.messageTextMaxLength;
    return plateOk && messageOk;
  });
  messageCharsCount = computed(() => this.messageText().length);
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
      .replace(/[^A-Z0-9-]/g, '')
      .slice(0, this.plateNumberMaxLength);
    this.plateNumber.set(sanitized);
  }

  onSenderNameChange(value: string | null | undefined) {
    this.senderName.set((value ?? '').slice(0, this.senderNameMaxLength));
  }

  applyRecommendation(message: string) {
    this.setMessageText(message);
  }

  onMessageTextChange(value: string | null | undefined) {
    this.setMessageText(value ?? '');
  }

  private setMessageText(value: string) {
    this.messageText.set(value.slice(0, this.messageTextMaxLength));
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
