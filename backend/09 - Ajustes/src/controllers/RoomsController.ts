import { Request, Response } from 'express';
import knex from '../database/connection';

class RoomsController {
    async index(request: Request, response: Response) {
        const rooms = await knex('rooms').select('rooms.*').orderBy('name');
        return response.json(rooms);
    }

    async dataUpdate(request: Request, response: Response) {
        const { id_room } = request.params;
        const room = await knex('rooms').where('id_room', id_room).first();
        if(!room){
            return response.send('Room not exists!');
        }
        return response.json(room);
    }

    async create(request: Request, response: Response) {

        const { name } = request.body;

        const trx = await knex.transaction();

        const roomExists = await trx('rooms').where('name', name).first();

        if (roomExists) {
            await trx.rollback();
            return response.status(400).send('Room already exists!');
        };

        const room = await trx('rooms').insert(request.body);

        await trx.commit();

        return response.send(`Room with id ${room} created with success!`);
    }

    async update(request: Request, response: Response) {
        const { id_room } = request.params;

        const { name, building } = request.body;

        const trx = await knex.transaction();

        const idExists = await trx('rooms').where('id_room', id_room).first();

        if (!idExists) {
            await trx.rollback();
            return response.status(400).send('Room not exists!');
        };

        const roomExists = await trx('rooms')
        .where('name', name)
        .whereNot('id_room', id_room)
        .first()
        .select('*');

        if (roomExists) {
            await trx.rollback();
            return response.status(400).send('Room already exists!');
        };

        const room = await trx('rooms').where('id_room', id_room).update({
            name,
            building
        });

        await trx.commit();

        return response.send(`Room with id ${room} updated with success!`);
    }

}

export default RoomsController;