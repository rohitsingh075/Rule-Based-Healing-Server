module.exports = {
  apps: [
    {
      name: "ncr-server",
      script: "index.js",
      watch: false,
      env: {
        PORT: 8181,
        NODE_ENV: "production",
        MONGO_URL: "mongodb://localhost:27017/SelfHealing",
        CLIENT_URL: "http://localhost:5173"
      }
    }
  ]
}
