import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '1234',
    database: 'empresa_prestamos',
});