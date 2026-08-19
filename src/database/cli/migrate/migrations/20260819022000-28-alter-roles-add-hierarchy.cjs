'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('roles', 'hierarchy', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 100,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('roles', 'hierarchy');
  }
};