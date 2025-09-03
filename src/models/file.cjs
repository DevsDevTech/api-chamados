// Em src/models/file.cjs

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class File extends Model {
    static associate(models) {
      this.belongsTo(models.Ticket, {
        foreignKey: 'ticketId',
        as: 'ticket',
      });
    }
  }

  File.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'file_size', 
    },
    contentType: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'content_type', 
    },
    ticketId: {
      type: DataTypes.UUID,
      field: 'ticket_id', 
    },
    userId: {
      type: DataTypes.UUID,
      field: 'user_id', 
    },
    commentId: {
      type: DataTypes.UUID,
      field: 'comment_id', 
    },
  }, {
    sequelize,
    modelName: 'File',
    tableName: 'Files',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return File;
};