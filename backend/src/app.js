const express = require('express');
const cors = require('cors');
const yaml = require('js-yaml');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const OpenApiValidator = require('express-openapi-validator');

// .js
const auth = require('./auth');
const mail = require('./mail');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const apiSpec = path.join(__dirname, '../api/openapi.yaml');

const apidoc = yaml.load(fs.readFileSync(apiSpec, 'utf8'));
app.use('/v0/api-docs', swaggerUi.serve, swaggerUi.setup(apidoc));

app.use(
  OpenApiValidator.middleware({
    apiSpec: apiSpec,
    validateRequests: true,
    validateResponses: true,
  }),
);

app.post('/v0/login', auth.login);
app.get('/v0/mail', auth.check, mail.getAll);
app.get('/v0/mail/:id', auth.check, mail.getById);
app.post('/v0/star/:id', auth.check, mail.markStar);
app.post('/v0/read/:id', auth.check, mail.markRead);
app.get('/v0/mailbox', auth.check, mail.getMailboxes);
// app.post('/v0/mailbox/:mb', auth.check, mail.insertMB);
app.put('/v0/mail/:id', auth.check, mail.put);
app.post('/v0/mail', auth.check, mail.post);

app.use((err, req, res, next) => {
  res.status(err.status).json({
    message: err.message,
    errors: err.errors,
    status: err.status,
  });
});

module.exports = app;
