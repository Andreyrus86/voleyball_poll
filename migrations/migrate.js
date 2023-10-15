let path = require('path');
(async () => {
  console.log('[migrations] started');
  await require('sql-migrations').run({
    migrationsDir: path.resolve(__dirname, 'migrations'),
    host: 'localhost',
    port: 54328,
    db: 'voleyball_poll',
    user: 'postgres',
    password: 'example',
    adapter: 'pg',
  });
  console.log('[migrations] finished');
})();