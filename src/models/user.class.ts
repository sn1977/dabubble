export class User {
  id?: string;
  avatar: string;  
  email: string;  
  name: string;
  isOnline: boolean;
  provider: string;

  constructor(obj?: any) {
    this.avatar = obj ? obj.avatar : '';    
    this.email = obj ? obj.email : '';    
    this.name = obj ? obj.name : '';
    this.isOnline = obj ? obj.isOnline : true;
    this.provider = obj ? obj.provider : '';
  }

  public toJSON() {
    return {
      avatar: this.avatar,
      email: this.email,      
      name: this.name,
      isOnline: this.isOnline,
      provider: this.provider,
    };
  }
}
