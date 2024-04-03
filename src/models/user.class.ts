export class User {
  id?: string;
  userName: string;  

  constructor(obj?: any) {
    this.userName = obj ? obj.userName : '';    
  }

  public toJSON() {
    return {
      userName: this.userName,
    };
  }
}
