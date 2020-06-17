import Knex from 'knex';

export async function up (knex: Knex) {
    return knex.schema.createTable('events', table => {
        table.increments('id_event').primary();
        table.string('name', 50).notNullable();
        table.string('description', 200);
        table.dateTime('date_time').notNullable();
        table.string('responsible', 50).notNullable();
    });
}

export async function down (knex: Knex) {
    return knex.schema.dropTable('events');
}