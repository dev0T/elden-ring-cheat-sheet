export class User {
  email!: String;
  profiles!: Profile[];
}

export interface Profile {
  name: string;
  checklist: { [key: string]: object };
}
