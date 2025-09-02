"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class InvalidatedToken extends Model {
    static associate(models) {}
  }
  InvalidatedToken.init(
    
      {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      token: {
        type: DataTypes.STRING(500),
        allowNull: false,
        unique: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'expires_at' 
      },
    },
    {
      sequelize,
      modelName: "InvalidatedToken", 
      tableName: "InvalidatedTokens", 
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return InvalidatedToken;
};
