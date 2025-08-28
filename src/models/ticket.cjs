"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Ticket extends Model {
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: "createdById",
        as: "creator",
      });
      this.belongsTo(models.User, {
        foreignKey: "assigneeId",
        as: "assignee",
      });
      this.hasMany(models.Comment, { 
        foreignKey: "ticketId", 
        as: "comments" 
      });
    }
  }

  Ticket.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("open", "in_progress", "resolved", "closed"),
        allowNull: false,
        defaultValue: "open",
      },
      priority: {
        type: DataTypes.ENUM("low", "medium", "high"),
        allowNull: false,
        defaultValue: "low",
      },
      createdById: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "created_by_id",
      },
      assigneeId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "assignee_id", // Mapeia para a coluna snake_case no banco
      },
    },
    {
      sequelize,
      modelName: "Ticket",
      tableName: "Tickets",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Ticket;
};
