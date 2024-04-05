export class User {
  id?: string;
  avatar: string;  
  email: string;  
  name: string;

  constructor(obj?: any) {
    this.avatar = obj ? obj.avatar : '';    
    this.email = obj ? obj.email : '';    
    this.name = obj ? obj.name : '';
  }

  public toJSON() {
    return {
      avatar: this.avatar,      
      email: this.email,      
      name: this.name,
    };
  }
}
