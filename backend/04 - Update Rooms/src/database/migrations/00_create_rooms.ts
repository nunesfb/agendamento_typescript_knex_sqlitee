import Knex from 'knex';

export async function up (knex: Knex) {
    return knex.schema.createTable('rooms', table => {
        table.increments('id_room').primary();
        table.string('name', 50).notNullable();
        table.string('building', 50).notNullable();
    });
}

export async function down (knex: Knex) {
    return knex.schema.dropTable('rooms');
}