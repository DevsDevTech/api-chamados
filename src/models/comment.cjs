"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      this.belongsTo(models.Ticket, {
        foreignKey: "ticketId",
        as: "ticket",
      });

      this.belongsTo(models.User, {
        foreignKey: "authorId",
        as: "author",
      });

      this.hasMany(models.File, {
        foreignKey: "commentId",
        as: "files",
      });
    }
  }

  Comment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true,
        allowNull: false,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      ticketId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "ticket_id",
      },
      authorId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "author_id",
      },
    },
    {
      sequelize,
      modelName: "Comment",
      tableName: "Comments",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Comment;
};
