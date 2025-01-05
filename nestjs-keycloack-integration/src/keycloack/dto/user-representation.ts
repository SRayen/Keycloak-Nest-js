export class UserRepresentation {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  enabled: boolean;
  credentials: Credential[];
}

export class Credential {
  type: string;
  value: string;
  temporary: boolean;
}
