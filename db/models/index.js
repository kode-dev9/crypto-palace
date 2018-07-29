const fs        = require('fs'),
  path      = require('path'),
  Sequelize = require('sequelize'),
  basename  = path.basename(__filename),
  env       = process.env.NODE_ENV || 'development',
  config    = require(__dirname + '/../config/config.json')[env],
  db        = {};

let sequelize = new Sequelize('crypto_palace', 'root', '', config);

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    let model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
