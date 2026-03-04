interface DatabaseConfig {
    username: string;
    password: string;
    database: string;
    host: string;
    port: number;
    dialect: 'postgres' | 'mysql';
    logging: boolean | typeof console.log;
}
interface Config {
    development: DatabaseConfig;
    production: DatabaseConfig;
    test: DatabaseConfig;
}
declare const config: Config;
export default config;
//# sourceMappingURL=database.d.ts.map