import { Injectable } from "@nestjs/common";
import { ClientModel } from "src/common/models/client.model";
import { UserModel } from "src/common/models/user.model";
import { SignInRequest } from "src/common/protocols/apis.models";

@Injectable()
export class AuthService {
  public users: UserModel[] = [];

  constructor() {
    //
  }

  signIn(data: SignInRequest["data"], client: ClientModel): UserModel {
    if (data.email === "" || data.password === "") {
      throw new Error("Email or password is empty");
    }

    // check email format is a valid email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error("Email format is invalid");
    }

    let user = this.users.find((user) => user.email === data.email);

    if (!user) {
      user = new UserModel({
        name: data.email,
        firstName: data.email.split("@")[0],
        lastName: data.email.split("@")[1],
        email: data.email,
      });
      user.password = data.password;
      this.users.push(user);
    }

    if (user.password !== data.password) {
      throw new Error("Password is incorrect");
    }

    if (client.user && client.user.email !== user.email) {
      // sign out the current user
      // sign in current user

      // temporary solution
      throw new Error("User already signed in");
    }

    client.user = user;
    return user;
  }

  signOut(client: ClientModel): void {
    if (!client.user) {
      throw new Error("User not signed in");
    }

    client.user = null;
  }
}
