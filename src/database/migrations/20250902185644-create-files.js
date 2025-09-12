"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Files", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4, 
        primaryKey: true,
        allowNull: false,
      },
      url: {
        type: Sequelize.STRING,
        defaultValue: Sequelize.STRING,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        defaultValue: Sequelize.STRING,
        allowNull: false,
      },
      ticket_id: {
        type: Sequelize.UUID,
        references: { model: "Tickets", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      comment_id: {
        type: Sequelize.UUID,
        references: { model: "Comments", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Files");
  },
};
