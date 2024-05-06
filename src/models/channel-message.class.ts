import { serverTimestamp } from '@angular/fire/firestore';

export class ChannelMessage {
  messageId?: string;
  channelId: string;
  creator: string;
  createdAt?: any;
  text: string;
  reactions?: string;
  attachment?: string[];


  constructor(obj?: any) {
    this.channelId = obj ? obj.channelId : '';
    this.creator = obj ? obj.creator : '';
    this.createdAt = obj ? obj.createdAt : '';
    this.text = obj ? obj.text : '';
    this.reactions = obj ? obj.reactions : '';
    this.attachment = obj ? obj.attachment : '';

  }

  public toJSON() {
    return {
      channelId: this.channelId,
      creator: this.creator,
      createdAt: serverTimestamp(),
      text: this.text,
      reactions: this.reactions,
      attachment: this.attachment,

    };
  }
}
