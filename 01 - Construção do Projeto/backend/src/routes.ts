import express from 'express';
import { celebrate, Joi } from 'celebrate';

//import PointsController from './controllers/PointsController';
//import ItensController from './controllers/ItensController';

const routes = express.Router();

//const pointsController = new PointsController();
//const iItensController = new ItensController();

routes.get('/', (request, response) => {
    return response.json('It works!');
});


export default routes;