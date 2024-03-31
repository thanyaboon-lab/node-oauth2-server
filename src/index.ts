import express, { Request, Response } from 'express';
import oAuthFlowRoutes from "./routes/oauth.flow";
import dotenv from 'dotenv'
import bodyParser from 'body-parser';
const mode = process.argv[2] ?? 'development'
dotenv.config({ path: `.env.${mode}` })

const port = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(express.urlencoded({ extended: true })); // support encoded bodies

app.use("/oauth", oAuthFlowRoutes);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
