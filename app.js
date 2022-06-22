const express = require('express');
const { param, body, validationResult } = require('express-validator');
const {NewmanRunner} = require('./runner');
const swaggerUi = require('swagger-ui-express');

class Application{
  constructor(newmanRunner = new NewmanRunner){
    this.newmanRunner = newmanRunner;
    this.expressApp = this.setupExpressApp();
  }

  setupExpressApp(){
    const expressApp = express();
    expressApp.use(express.static('public'));
    var options = {
      swaggerOptions: {
        url: '/openapi.json'
      }
    }
    expressApp.use('/api-docs', swaggerUi.serve, swaggerUi.setup(null, options));
    expressApp.use(express.json());
    
    expressApp.post(
        '/run/:reporter',
        param('reporter').isIn(['html','json']).withMessage('Only the json and html reporters are supported'),
        body('collection').isJSON().withMessage('The test collection must be provided as a JSON string'),
        body('iterationData').optional().isJSON().withMessage('The test iteration data must be provided as a JSON string'),
        (req, res) => {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
          }
    
          const collection = JSON.parse(req.body.collection);
          const iterationData = req.body.iterationData? JSON.parse(req.body.iterationData):null;
          this.newmanRunner.runCollection(res, req.params.reporter, collection, iterationData);
        },
    );

    return expressApp;
  }
}

module.exports = {Application};