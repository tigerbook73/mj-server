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

    const user = this.users.find((user) => user.email === data.email);

    if (!user) {
      // throw new Error("User not found");
      // create a new user
      const newUser = new UserModel({
        name: data.email,
        firstName: "",
        lastName: "",
        email: data.email,
      });
      newUser.password = data.password;

      this.users.push(newUser);
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
