module.exports = {
  apps: [{
    name: 'notion2',
    script: 'dist/server/main.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
} 