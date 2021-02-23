import { MaxLength } from "class-validator";
import { Arg, Field, ID, Mutation, InputType, ObjectType } from "type-graphql";
import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { hash } from "argon2";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@InputType()
class CreateUser {
  @Field()
  @MaxLength(30)
  email!: string;

  @Field()
  @MaxLength(30)
  password!: string;
}

@ObjectType()
@Entity()
class User {
  @Field((type) => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  email!: string;

  @Column()
  hashedPassword?: string;
}

@Service()
class UserResolver {
  constructor(
    @Inject("user-repository") private repository: Repository<User>
  ) {}

  @Mutation((returns) => User)
  async createUser(@Arg("input") input: CreateUser): Promise<User> {
    const user = new User();
    user.email = input.email;
    user.hashedPassword = await hash(input.password);
    return await this.repository.save(user);
  }
}

export { UserResolver };
