export interface UserCreateDto {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * Represents a user in the system.
 */
export class UserModel {
  name: string; // use email as default
  firstName: string;
  lastName: string;
  email: string;
  password: string;

  constructor(userCreate: UserCreateDto) {
    this.name = userCreate.name;
    this.firstName = userCreate.firstName;
    this.lastName = userCreate.lastName;
    this.email = userCreate.email;
  }

  toJSON(): any {
    return {
      name: this.name,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
    };
  }
}
