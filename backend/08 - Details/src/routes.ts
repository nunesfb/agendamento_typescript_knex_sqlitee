import express from 'express';
import { celebrate, Joi } from 'celebrate';

import RoomsController from './controllers/RoomsController';
import EventsController from './controllers/EventsController';

const routes = express.Router();

const roomsController = new RoomsController();
const eventsController = new EventsController();

routes.get('/rooms', roomsController.index);
routes.post('/rooms', celebrate({
    body: Joi.object().keys({
    name: Joi.string().required().max(50),
    building: Joi.string().required().max(50)
})}, { abortEarly: false }),
roomsController.create);
routes.put('/rooms/:id_room', roomsController.update);
routes.get('/rooms/:id_room', roomsController.dataUpdate);

routes.get('/events', eventsController.index);
routes.get('/events_day', eventsController.eventsOfDay);
routes.post('/events', celebrate({
    body: Joi.object().keys({
    name: Joi.string().required().max(50),
    description: Joi.string().required().max(200),
    responsible: Joi.string().required().max(50),
})}, { abortEarly: false }), eventsController.create);
routes.delete('/events/:id_event', eventsController.remove);
routes.get('/events/:id_event', eventsController.dataRemove);

export default routes;