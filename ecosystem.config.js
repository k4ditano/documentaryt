module.exports = {
  apps: [{
    name: 'notion2',
    script: 'backend/src/server.js',
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}; 