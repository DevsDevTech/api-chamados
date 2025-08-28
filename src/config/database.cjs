// src/config/database.cjs

module.exports = {
  development: { 
    dialect: 'postgres',
    host: 'localhost',
    username: 'postgres',
    password: 'docker123',
    database: 'api-chamados',
    define: {
      timestamps: true,
      underscored: true,
      underscoredAll: true,
    },
  },
};