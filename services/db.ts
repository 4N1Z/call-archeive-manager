import { Pool } from '@neondatabase/serverless';

const sql = new Pool({
    connectionString: import.meta.env.VITE_DATABASE_URL,
});

export default sql;
