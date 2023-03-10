import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import cors from "cors";
import { errorHandler } from './middleware/error-handler';
import { NotFoundError } from './middleware/not-found-error';
import router from './routes/router';
import bodyParser from "body-parser";
import cookieparser from 'cookie-parser'

const app = express();

var corsOptions = {
  origin: '*', 
  
}
app.use(cookieparser());
app.use(cors(corsOptions));
app.use(express.json());
app.set('trust proxy',true);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
    signed:false,
    secure: process.env.NODE_ENV !== 'test',
}))

app.use(
  cookieSession({
    signed: false, 
    secure : true, 
    // secure: process.env.NODE_ENV !== 'test',
  })
);

// Router
app.use(router);


app.all('*', async () => {
  throw new NotFoundError();
});
app.use(errorHandler);

export { app };