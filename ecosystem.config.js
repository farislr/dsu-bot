module.exports = {
    apps: [
        {
            name: 'dsu-bot',
            script: 'node_modules/.bin/next',
            args: 'start',
            instances: 1,
            exec_mode: 'cluster',
            interpreter: 'node',
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 3000,
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000,
            },
            env_development: {
                NODE_ENV: 'development',
                PORT: 3000,
            },
            error_file: './logs/pm2-error.log',
            out_file: './logs/pm2-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            min_uptime: '10s',
            max_restarts: 10,
            restart_delay: 4000,
        },
    ],
};
