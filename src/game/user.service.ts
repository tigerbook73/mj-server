import { Injectable } from "@nestjs/common";
import { Position } from "src/common/core/mj.game";
import { UserType } from "src/common/models/common.types";
import { UserCreateDto, UserModel } from "src/common/models/user.model";

@Injectable()
export class UserService {
  public users: UserModel[] = [];

  constructor() {
    // create default BOT users
    this.users = [
      this.createBot(Position.East),
      this.createBot(Position.South),
      this.createBot(Position.West),
      this.createBot(Position.North),
    ];
  }

  create(userCreate: UserCreateDto): UserModel {
    if (userCreate.name.startsWith("bot")) {
      throw new Error("User name can not start with 'bot'.");
    }
    if (this.users.find((user) => user.name === userCreate.name)) {
      throw new Error(`User with name ${userCreate.name} already exists.`);
    }

    const user = new UserModel(userCreate);
    this.users.push(user);
    return user;
  }

  createBot(position: Position): UserModel {
    if (this.findBot(position)) {
      throw new Error(`Bot with position ${position} already exists.`);
    }

    const bot = new UserModel(
      {
        name: `bot-${position}`,
        firstName: "bot",
        lastName: Position[position],
        email: `${position}@mj-game.com`,
      },
      "",
      UserType.Bot,
    );
    this.users.push(bot);
    return bot;
  }

  find(name: string): UserModel | null {
    return (
      this.users.find(
        (user) => user.type === UserType.Human && user.name === name,
      ) ?? null
    );
  }

  findAll(): UserModel[] {
    return this.users;
  }

  findBot(position: Position): UserModel | null {
    return (
      this.users.find(
        (user) =>
          user.type === UserType.Bot && user.lastName === Position[position],
      ) ?? null
    );
  }

  delete(name: string): void {
    // send event to all subscribers
    // ...

    this.users = this.users.filter((user) => user.name !== name);
  }
}
