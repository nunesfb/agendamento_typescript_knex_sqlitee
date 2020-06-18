import express from 'express';

import RoomsController from './controllers/RoomsController';
import EventsController from './controllers/EventsController';

const routes = express.Router();

const roomsController = new RoomsController();
const eventsController = new EventsController();

routes.get('/rooms', roomsController.index);
routes.post('/rooms', roomsController.create);
routes.put('/rooms/:id_room', roomsController.update);

routes.get('/events', eventsController.index);
routes.get('/events_day', eventsController.eventsOfDay);
routes.post('/events', eventsController.create);
routes.delete('/events/:id_event', eventsController.remove);

export default routes;