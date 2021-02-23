import { Service } from "typedi";
import { buildSchema } from "type-graphql";
import { Tokens, AuthResolver } from "./resolver";
import Container from "typedi";
import { ApolloServer } from "apollo-server";
import {
  ApolloServerTestClient,
  createTestClient,
} from "apollo-server-testing";

beforeAll(() => {
  Container.set("log-in", async (_email: string, _password: string) => {
    return Object.assign(new Tokens(), {
      access: "a",
      refresh: "b",
    });
  });

  Container.set("renew-tokens", null);
});

test("logIn", async () => {
  const { query } = await getQuery();

  const LOGIN = `
    {
        logIn(email: "c@mail.com", password: "aaaaaaaa") {
            access
            refresh
        }
    }
  `;

  const {
    errors,
    data: { logIn },
  } = await query({ query: LOGIN });

  expect(errors).toBeUndefined();
  expect(logIn).toEqual({ access: "a", refresh: "b" });
});

const getQuery = async (): Promise<ApolloServerTestClient> => {
  const schema = await buildSchema({
    resolvers: [AuthResolver],
    container: Container,
  });

  const server = new ApolloServer({
    schema,
    playground: false,
  });

  return createTestClient(server);
};
