import { sign, verify } from "jsonwebtoken";
import { Service } from "typedi";
import { ValidationFailed, EnvNotFound } from "./error";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
class Tokens {
  @Field()
  access!: string;

  @Field()
  refresh!: string;
}

interface AuthService {
  logIn(email: string, password: string): Promise<Tokens>;
  refreshTokens(refreshToken: string): Promise<Tokens>;
}

@Service()
class RealAuthService {
  /**
   * @throws {ValidationFailed, EnvNotFound}
   */
  async logIn(email: string, password: string): Promise<Tokens> {
    if (!this.valid(email, password)) {
      throw new ValidationFailed("invalid login");
    }

    if (process.env.PRIVATE_KEY === undefined) {
      throw new EnvNotFound("private key is undefined");
    }

    let accessToken = sign({ email: email }, process.env.PRIVATE_KEY, {
      expiresIn: "1h",
    });

    let refreshToken = sign({ email: email }, process.env.PRIVATE_KEY, {
      expiresIn: "1d",
    });

    return Object.assign(new Tokens(), {
      access: accessToken,
      refresh: refreshToken,
    });
  }

  /**
   * @throws {ValidationFailed, EnvNotFound, JsonWebTokenError}
   */
  async refresh(email: string, token: string): Promise<Tokens> {
    if (process.env.PRIVATE_KEY === undefined) {
      throw new EnvNotFound("private key is undefined");
    }

    let decoded: any = verify(token, process.env.PRIVATE_KEY);
    if (decoded.email !== email) {
      throw new ValidationFailed("decoded email doesn't match");
    }

    let accessToken = sign({ email: email }, process.env.PRIVATE_KEY, {
      expiresIn: "1h",
    });

    let refreshToken = sign({ email: decoded.email }, process.env.PRIVATE_KEY, {
      expiresIn: "1d",
    });

    return Object.assign(new Tokens(), {
      access: accessToken,
      refresh: refreshToken,
    });
  }

  async valid(email: string, password: string): Promise<boolean> {
    throw "now implemented!";
  }
}

export { AuthService, RealAuthService, Tokens };
