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
      this.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
      this.belongsTo(models.Comment, {
        foreignKey: 'commentId',
        as: 'comment',
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
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.STRING,
      allowNull: false,
    },
    ticketId: {
      type: DataTypes.UUID,
      field: 'ticket_id', 
      references: {
        model: 'Tickets', 
        key: 'id',
      },
      onUpdate: 'CASCADE', 
      onDelete: 'CASCADE',
    },
    userId: {
      type: DataTypes.UUID,
      field: 'user_id', 
      references: {
        model: 'Users', 
        key: 'id',
      },
      onUpdate: 'CASCADE', 
      onDelete: 'CASCADE',
    },
    commentId: {
      type: DataTypes.UUID,
      field: 'comment_id', 
      references: {
        model: 'Comments', 
        key: 'id',
      },
      onUpdate: 'CASCADE', 
      onDelete: 'CASCADE',
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