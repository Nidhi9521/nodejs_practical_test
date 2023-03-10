import { Pool } from 'pg';

const pool = new Pool({
    user: 'nidhi.gokani',
    host: 'localhost',
    database: 'test',
    password: 'test',
    port: 5432,
});

export default pool;