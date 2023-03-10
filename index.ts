import { app } from './app';
import pool from './config/db-connectors';
const port = 3001;

const start = async () => {
  
  try {
    pool.connect(function (err: any, client, done) {
        if (err) throw new Error(err);
        console.log('Connected');
    });
    
  } catch (error: any) {
    throw Error(error);
  }

  app.listen(port,()=>{
    console.log('listen at',port);
    
  });
};

start();
