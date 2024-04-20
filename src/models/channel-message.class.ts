export class ChannelMessage {
  messageId?: string;
  channelId: string;
  creator: string;
  createdAt: Date = new Date();
  text: string;
  reactions: string [];

  constructor(obj?: any) {

    this.channelId = obj ? obj.channelId : '';
    this.creator =  obj ? obj.creator : '';
    this.createdAt = obj ? obj.createdAt : '';    
    this.text = obj ? obj.text : '';
    this.reactions = obj ? obj.reactions : '';    
  }

  public toJSON() {
    return {
      channelId: this.channelId,
      creator: this.creator,
      createdAt: this.createdAt,
      text: this.text,
      reactions: this.reactions,      
    };
  }
}
