import { Injectable } from "@nestjs/common";
import { UserCreateDto, UserModel } from "src/common/models/user.model";

@Injectable()
export class UserService {
  public users: UserModel[] = [];

  constructor() {
    //
  }

  create(userCreate: UserCreateDto): UserModel {
    if (this.users.find((user) => user.name === userCreate.name)) {
      throw new Error(`User with name ${userCreate.name} already exists.`);
    }

    const user = new UserModel(userCreate);
    this.users.push(user);
    return user;
  }

  find(name: string): UserModel {
    return this.users.find((user) => user.name === name) ?? null;
  }

  findAll(): UserModel[] {
    return this.users;
  }

  delete(name: string): void {
    // send event to all subscribers
    // ...

    this.users = this.users.filter((user) => user.name !== name);
  }
}
