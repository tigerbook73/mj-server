import { UserType } from "./common.types";

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
  constructor(
    public name: string, // use email as default
    public firstName: string,
    public lastName: string,
    public email: string,
    public password: string,
    public type: UserType,
  ) {}

  static create(userCreate: UserCreateDto): UserModel {
    const user = new UserModel(
      userCreate.name,
      userCreate.firstName,
      userCreate.lastName,
      userCreate.email,
      "",
      UserType.Human,
    );
    return user;
  }

  static fromJSON(data: any): UserModel {
    const user = new UserModel(
      data.name,
      data.firstName,
      data.lastName,
      data.email,
      data.password,
      data.type,
    );
    return user;
  }

  toJSON() {
    return {
      name: this.name,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      type: this.type,
    };
  }
}
