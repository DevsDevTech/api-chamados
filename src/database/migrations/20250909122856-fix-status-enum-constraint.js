'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const enumName = 'enum_Tickets_status';
      const tableName = 'Tickets';
      const columnName = 'status';

      await queryInterface.sequelize.query(
        `ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" DROP DEFAULT;`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" TYPE VARCHAR(255);`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DROP TYPE "${enumName}";`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `CREATE TYPE "${enumName}" AS ENUM('aberto', 'em_andamento', 'fechado');`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" TYPE "${enumName}" USING ("${columnName}"::"${enumName}");`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" SET DEFAULT 'aberto';`,
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      console.error('Erro na migration do ENUM:', err);
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log("A reversão desta migration não é suportada automaticamente.");
  }
};