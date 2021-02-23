import { buildSchema } from "type-graphql";
import { LogInResolver, LogInService, RealLogInService } from "./login";
import Container from "typedi";

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  const schema = await buildSchema({
    resolvers: [LogInResolver],
  });

  Container.set<LogInService>("login-service", RealLogInService);

  const server = new ApolloServer({
    schema,
    playground: true,
  });

  // Start the server
  const { url } = await server.listen(PORT);
  console.log(`Server is running, GraphQL Playground available at ${url}`);
}

bootstrap();
