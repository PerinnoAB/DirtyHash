/* Copyright 2022 Perinno AB. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/

import 'reflect-metadata';
import { defaultMetadataStorage } from 'class-transformer';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import cors from 'cors';
import { useExpressServer, getMetadataArgsStorage } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import swaggerUi from 'swagger-ui-express';
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS } from '@config';
import errorMiddleware from '@middlewares/error.middleware';
import { logger } from '@utils/logger';

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor(Controllers: Function[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;

    this.initializeMiddlewares();
    this.initializeRoutes(Controllers);
    this.initializeSwagger(Controllers);
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(
      morgan(LOG_FORMAT, {
        skip: function (req, res) {
          // log only search and report requests
          return !(req.url.startsWith('/query') || req.url.startsWith('/report'));
        },
      }),
    );
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(cors());
  }

  private initializeRoutes(controllers: Function[]) {
    useExpressServer(this.app, {
      cors: {
        origin: ORIGIN,
        credentials: CREDENTIALS,
      },
      controllers: controllers,
      defaultErrorHandler: false,
    });
  }

  private initializeSwagger(controllers: Function[]) {
    const schemas = validationMetadatasToSchemas({
      classTransformerMetadataStorage: defaultMetadataStorage,
      refPointerPrefix: '#/components/schemas/',
    });

    const routingControllersOptions = {
      controllers: controllers,
    };

    const storage = getMetadataArgsStorage();
    const spec = routingControllersToSpec(storage, routingControllersOptions, {
      components: {
        schemas,
        // securitySchemes: {
        //   basicAuth: {
        //     scheme: 'basic',
        //     type: 'http',
        //   },
        // },
      },
      info: {
        description:
          '### Analyze suspicious wallet addresses, domains, NFTs with machine learning to detect frauds and scams, share them with the community.\n##### *For full access, please email contact@dirtyhash.com to get your API key.*',
        title: 'DirtyHash™ REST API Documentation',
        version: '1.0.0',
      },
    });

    const swaggerUIOptions = {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'DirtyHash API | The leading Crypto Fraud Prevention service',
      customfavIcon: 'https://dirtyhash.com/favicon.ico',
    };

    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec, swaggerUIOptions));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;
