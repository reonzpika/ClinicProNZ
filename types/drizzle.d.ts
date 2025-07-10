import 'drizzle-kit';

declare module 'drizzle-kit' {
  type Config = {
    schema?: string | string[];
    out?: string;
    driver?: 'pg' | 'mysql' | 'better-sqlite' | 'd1' | 'libsql' | 'turso';
    dbCredentials?: {
      connectionString?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
}
