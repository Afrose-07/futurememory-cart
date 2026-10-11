import mysql from 'mysql2/promise';

let mysqlPool = null;
let isMySQLConnected = false;

export const connectMySQL = async () => {
  const host = process.env.MYSQL_HOST || 'localhost';
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || 'futurememory';
  const port = parseInt(process.env.MYSQL_PORT || '3306', 10);

  try {
    mysqlPool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const connection = await mysqlPool.getConnection();
    connection.release();
    isMySQLConnected = true;
    console.log(`✅ [MySQL] Connected successfully to host: ${host}, database: ${database}`);
    return mysqlPool;
  } catch (error) {
    isMySQLConnected = false;
    console.warn(`⚠️ [MySQL] Connection failed: ${error.message}`);
    console.warn(`ℹ️ [MySQL Notice] If using MySQL, verify credentials in server/.env and ensure MySQL server is running.`);
    return null;
  }
};

export const getMySQLStatus = () => isMySQLConnected;
export { mysqlPool };
