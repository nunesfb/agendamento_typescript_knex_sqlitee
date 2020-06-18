import Knex from 'knex';

export async function up (knex: Knex) {
    return knex.schema.createTable('rooms_events', table => {
        table.increments('id_rooms_events').primary();
        table.integer('id_room').notNullable().references('id_room').inTable('rooms');
        table.integer('id_event').notNullable().references('id_event').inTable('events');
    });
}

export async function down (knex: Knex) {
    return knex.schema.dropTable('rooms_events');
}