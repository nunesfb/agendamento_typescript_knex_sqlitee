import { Request, Response } from 'express';
import knex from '../database/connection';
import { parseISO, startOfHour, format, startOfDay, endOfDay, isPast } from 'date-fns';

class EventsController {
    async index(request: Request, response: Response) {

        const { } = request.query;

        const events = await knex('rooms_events')
            .join('events', 'events.id_event', '=', 'rooms_events.id_event')
            .join('rooms', 'rooms.id_room', '=', 'rooms_events.id_room')
            .select([
                knex.raw("group_concat(rooms.name) AS room_name"), 
                knex.raw("group_concat(rooms.building) AS building"), 
                'events.*'
            ])
            .groupBy('rooms_events.id_event')
            .orderBy('date_time')

        const serializedItens = events.map(event => {

            const buildingArray = event.building.split(',');
            const roomNameArray = event.room_name.split(',');

            const buildingsRooms = [];

            for(var i = 0; i < buildingArray.length; i++){
                buildingsRooms.push({building: buildingArray[i], room: roomNameArray[i]});
            }

            return {
                id_event: event.id_event,
                location: buildingsRooms,
                name_event: event.name,
                description: event.description,
                date_time: format(event.date_time, "'Data: 'dd'/'MM'/'yyyy 'Horário:' HH':'mm"),
                responsible: event.responsible
            }
        })

        response.json(serializedItens);
    }

    async eventsOfDay(request: Request, response: Response) {

        const { day = Date.now() } = request.query;

        const searchDate = parseISO(day.toLocaleString());

        const events = await knex('rooms_events')
            .join('events', 'events.id_event', '=', 'rooms_events.id_event')
            .join('rooms', 'rooms.id_room', '=', 'rooms_events.id_room')
            .select([
                knex.raw("group_concat(rooms.name) AS room_name"), 
                knex.raw("group_concat(rooms.building) AS building"), 
                'events.*'
            ])
            .groupBy('rooms_events.id_event')
            .orderBy('date_time')
            .whereBetween('date_time', [startOfDay(searchDate), endOfDay(searchDate)])

        const serializedItens = events.map(event => {

            const buildingArray = event.building.split(',');
            const roomNameArray = event.room_name.split(',');

            const buildingsRooms = [];

            for(var i = 0; i < buildingArray.length; i++){
                buildingsRooms.push({building: buildingArray[i], room: roomNameArray[i]});
            }

            return {
                id_event: event.id_event,
                location: buildingsRooms,
                name_event: event.name,
                description: event.description,
                date_time: format(event.date_time, "'Data: 'dd'/'MM'/'yyyy 'Horário:' HH':'mm"),
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
            return response.send('This date is before the actual date and hour!');
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
                return response.send('There is an event already booked in the same local for this date and time!');
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

        return response.send('Event inserted with success!');
    }

    async remove(request: Request, response: Response) {
        const { id_event } = request.params;

        const trx = await knex.transaction();

        const verify = await trx('events').where('id_event', id_event).del();

        if(verify === 0){
            await trx.rollback();
            return response.send('Event not exists!');
        }
        await trx('rooms_events').where('id_event', id_event).del();

        await trx.commit();

        return response.send('Event deleted with success!');
    }


    async dataRemove(request: Request, response: Response) {
        const { id_event } = request.params;

        const event = await knex('events').where('id_event', id_event).first();

        if(!event){
            return response.send('Event not exists!');
        }
        return response.json({
            id_event: event.id_event,
            building: event.building,
            description: event.description,
            date_time: format(event.date_time, "dd'/'MM'/'yyyy HH':'mm"),
            responsible: event.responsible
        });
    }
}
export default EventsController; 