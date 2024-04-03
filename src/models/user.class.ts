export class User {
  id?: string;
  avatar: string;
  badPasswordCount: string;
  email: string;
  isActive: boolean;
  isBlocked: boolean;
  isOnline: boolean;
  name: string;
  password: string;


  constructor(obj?: any) {
    this.avatar = obj ? obj.avatar : '';
    this.badPasswordCount = obj ? obj.badPasswordCount : '';
    this.email = obj ? obj.email : '';
    this.isActive = obj ? obj.isActive : true;
    this.isBlocked = obj ? obj.isBlocked : true;
    this.isOnline = obj ? obj.isOnline : true;
    this.name = obj ? obj.name : '';
    this.password = obj ? obj.password : '';
  }

  public toJSON() {
    return {
      avatar: this.avatar,
      badPasswordCount : this.badPasswordCount,
      email: this.email,
      isActive: this.isActive,
      isBlocked: this.isBlocked,
      isOnline: this.isOnline,      
      name: this.name,
      password: this.password
    };
  }
}
