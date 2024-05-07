import { User } from "./user.class";

export class Channel {
  id?: string;
  creator: string;
  description: string;
  member: any[];
  name: string;
  count: number;

  constructor(obj?: any) {
    this.creator = obj ? obj.creator : '';
    this.description = obj ? obj.description : '';
    this.member = obj && obj.member ? obj.member : [];
    this.name = obj ? obj.name : '';
    this.count = obj ? obj.count: 0;
  }

  public toJSON() {
    return {
      creator: this.creator,
      description: this.description,
      member: this.member,
      name: this.name,
      count: this.count,
    };
  }
}
