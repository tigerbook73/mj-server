import { Injectable } from "@nestjs/common";
import { ClientModel } from "src/common/models/client.model";
import { UserModel } from "src/common/models/user.model";
import { SignInRequest } from "src/common/protocols/apis.models";
import { RoomService } from "./room.service";
import { UserService } from "./user.service";

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private roomService: RoomService,
  ) {}

  signIn(data: SignInRequest["data"], client: ClientModel): UserModel {
    // check user is signed in or not
    if (client.user) {
      throw new Error("User already signed in");
    }

    if (data.email === "" || data.password === "") {
      throw new Error("Email or password is empty");
    }

    // check email format is a valid email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error("Email format is invalid");
    }

    let user = this.userService.find(data.email);

    if (!user) {
      user = this.userService.create({
        name: data.email,
        firstName: data.email.split("@")[0],
        lastName: data.email.split("@")[1],
        email: data.email,
      });
      user.password = data.password;
    }

    if (user.password !== data.password) {
      throw new Error("Password is incorrect");
    }

    client.user = user;
    return user;
  }

  signOut(client: ClientModel): void {
    if (!client.user) {
      throw new Error("User not signed in");
    }

    this.roomService.dropUser(client.user);
    client.user = null;
  }
}
