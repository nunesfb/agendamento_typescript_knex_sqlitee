import { Request, Response } from 'express';
import knex from '../database/connection';
import { parseISO, startOfHour, format, startOfDay, endOfDay, isPast } from 'date-fns';

class EventsController {
    async index(request: Request, response: Response) {

        const { } = request.query;

        const events = await knex('rooms_events')
            .join('events', 'events.id_event', '=', 'rooms_events.id_event')
            .join('rooms', 'rooms.id_room', '=', 'rooms_events.id_room')
            .select('rooms.name AS room_name', 'rooms.building', 'events.*');

        const serializedItens = events.map(event => {

            return {
                id_event: event.id_event,
                building: event.building,
                name_room: event.room_name,
                name_event: event.name,
                description: event.description,
                date_time: format(event.date_time, "dd'/'MM'/'yyyy HH':'mm"),
                responsible: event.responsible
            }
        })

        response.json(serializedItens);
    }

    async create(request: Request, response: Response) {
        const {
            name,
            description,
            date_time,
            responsible,
            rooms
        } = request.body;

        const trx = await knex.transaction();

        const parsedDateTime = (parseISO(date_time));

        if (isPast(parsedDateTime)) {
            await trx.rollback();
            return response.json('This date is before the actual date and hour!');
        }

        const eventDateTime = startOfHour(parsedDateTime);

        for (var i = 0; i < rooms.length; i++) {
            const findEventInSameDate = await trx('rooms_events')
                .join('events', 'events.id_event', '=', 'rooms_events.id_event')
                .join('rooms', 'rooms.id_room', '=', 'rooms_events.id_room')
                .where('date_time', eventDateTime)
                .where('rooms_events.id_room', rooms[i])
                .select('*')
                .first();

            if (findEventInSameDate) {
                await trx.rollback();
                return response.json('There is an event already booked in the same local for this date and time!');
            }
        }

        const event = {
            name,
            description,
            date_time: eventDateTime,
            responsible
        };

        const eventCreated = await trx('events').insert(event);

        const id_event = eventCreated[0];

        const rooms_events = rooms
            .map((id_room: number) => {
                return {
                    id_room,
                    id_event
                }
            });

        await trx('rooms_events').insert(rooms_events);

        await trx.commit();

        return response.json({ message: 'Event inserted with success!' });
    }

    async remove(request: Request, response: Response) {
        const { id_event } = request.params;

        const trx = await knex.transaction();

        const verify = await trx('events').where('id_event', id_event).del();

        if(verify === 0){
            await trx.rollback();
            return response.json({ message: 'Event not exists!' });
        }
        await trx('rooms_events').where('id_event', id_event).del();

        await trx.commit();

        return response.json({message: 'Event deleted with success!'});
    }
}
export default EventsController; 