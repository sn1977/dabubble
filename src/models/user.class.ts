export class User {
  id?: string;
  avatar?: string;
  email: string;
  displayName: string;
  isOnline: boolean;
  provider: string;

  constructor(obj?: any) {
    this.avatar = obj ? obj.avatar : '';
    this.email = obj ? obj.email : '';
    this.displayName = obj ? obj.displayName : '';
    this.isOnline = obj ? obj.isOnline : true;
    this.provider = obj ? obj.provider : '';
  }

  public toJSON() {
    return {
      avatar: this.avatar,
      email: this.email,
      displayName: this.displayName,
      isOnline: this.isOnline,
      provider: this.provider,
    };
  }
}
