import express, { Request, Response } from 'express';
import oAuthFlowRoutes from "./routes/oauth.flow";
import oAuthClientRoutes from "./routes/oauth.client";
import dotenv from 'dotenv'
import bodyParser from 'body-parser';
import { jwks, openidConfiguration } from './openid-configuration';
import discover from './openid';
import session from 'express-session';

const mode = process.argv[2] ?? 'development'
dotenv.config({ path: `.env.${mode}` })

const port = process.env.PORT || 3000;

const app = express();

app.use(session({
  secret: 'c6ac6ac3acf2e7fe145ab632dcf13d3f59c6447237e2620fd4139c1bb002aba4',
  resave: false,
  saveUninitialized: true,
  // cookie: {
  //   secure: true,
  // }
}));

app.use(bodyParser.json()); // support json encoded bodies
app.use(express.urlencoded({ extended: true })); // support encoded bodies

app.use("/oauth", oAuthFlowRoutes);
app.use("/callback", oAuthClientRoutes);

app.use("/.well-known/openid-configuration/jwks", jwks);
app.use("/.well-known/openid-configuration", openidConfiguration);

discover()

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
