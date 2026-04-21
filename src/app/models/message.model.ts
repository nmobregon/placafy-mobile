export interface Message {
  id: string;
  plateNumber: string;
  text: string;
  senderName: string;
  createdAt: Date;
}

export interface SendMessageData {
  plateNumber: string;
  text: string;
  senderName?: string;
}
