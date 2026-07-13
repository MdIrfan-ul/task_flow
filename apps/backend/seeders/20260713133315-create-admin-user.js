'use strict';

/** @type {import('sequelize-cli').Migration} */
const bcrypt = require('bcryptjs');
module.exports = {
  async up(queryInterface, Sequelize) {
    const [admins] = await queryInterface.sequelize.query(`
      SELECT id
      FROM users
      WHERE user_type = 'admin'
      LIMIT 1;
    `);

    if (admins.length) {
      console.log('Site Admin already exists. Skipping...');
      return;
    }

    const password = await bcrypt.hash(
      process.env.ADMIN_PASSWORD,
      Number(process.env.PASSWORD_ROUND || 10),
    );

    await queryInterface.bulkInsert('users', [
      {
        name: process.env.ADMIN_NAME,
        email: process.env.ADMIN_EMAIL,
        password,
        user_type: 'admin',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    console.log('Site Admin created.');

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      role: 'admin',
    });
  }
};
