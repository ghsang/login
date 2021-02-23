import { IsEmail, MaxLength, MinLength } from "class-validator";
import "reflect-metadata";
import { Args, ArgsType, Field, Query, Resolver } from "type-graphql";
import { Inject, Service } from "typedi";
import { AuthService, Tokens } from "./service";

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
  refreshToken!: string;
}

@Service()
@Resolver()
class AuthResolver {
  constructor(@Inject("auth-service") private authService: AuthService) {}

  /**
   * @throws {ValidationFailed, EnvNotFound}
   */
  @Query((returns) => Tokens)
  async logIn(@Args() { email, password }: LogInArgs) {
    return await this.authService.logIn(email, password);
  }

  /**
   * @throws {ValidationFailed, EnvNotFound, JsonWebTokenError}
   */
  @Query((returns) => Tokens)
  async renewTokens(@Args() { refreshToken }: RenewTokensArgs) {
    return await this.authService.refreshTokens(refreshToken);
  }
}

export { AuthResolver, Tokens };
