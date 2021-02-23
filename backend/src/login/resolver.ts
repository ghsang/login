import { IsEmail, MaxLength, MinLength } from "class-validator";
import "reflect-metadata";
import { Args, ArgsType, Field, Query, Resolver } from "type-graphql";
import { Inject, Service } from "typedi";
import { Tokens } from "./service";

@ArgsType()
class LogInArgs {
  @Field()
  @MaxLength(50)
  @IsEmail()
  email!: string;

  @Field()
  @MaxLength(50)
  @MinLength(8)
  password!: string;
}

@ArgsType()
class RenewTokensArgs {
  @Field()
  email!: string;

  @Field()
  refreshToken!: string;
}

type LogIn = (email: string, password: string) => Promise<Tokens>;
type RenewTokens = (email: string, refreshToken: string) => Promise<Tokens>;

@Service()
@Resolver()
class AuthResolver {
  constructor(
    @Inject("log-in") private _logIn: LogIn,
    @Inject("renew-tokens") private _renewTokens: RenewTokens
  ) {}

  /**
   * @throws {ValidationFailed, EnvNotFound}
   */
  @Query((returns) => Tokens)
  async logIn(@Args() { email, password }: LogInArgs) {
    return await this._logIn(email, password);
  }

  /**
   * @throws {ValidationFailed, EnvNotFound, JsonWebTokenError}
   */
  @Query((returns) => Tokens)
  async renewTokens(@Args() { email, refreshToken }: RenewTokensArgs) {
    return await this._renewTokens(email, refreshToken);
  }
}

export { AuthResolver, Tokens };
