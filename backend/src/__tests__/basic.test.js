const supertest = require('supertest');
const http = require('http');

const db = require('./db');
const app = require('../app');

let server;

beforeAll(() => {
  server = http.createServer(app);
  server.listen();
  request = supertest(server);
  return db.reset();
});

afterAll((done) => {
  server.close(done);
  db.shutdown();
});

test('GET Invalid URL', async () => {
  await request.get('/v0/so-not-a-real-end-point-ba-bip-de-doo-da/')
    .expect(404);
});

const badLogin = {
  'username': 'molly@ucsc.edu',
  'password': 'mollypassword',
};

test('POST Invalid username', async () => {
  await request.post('/v0/login/')
    .send(badLogin)
    .expect(401);
});

const validLogin = {
  'username': 'molly@books.com',
  'password': 'mollymember',
};

test('POST Valid username and password', async () => {
  await request.post('/v0/login/')
    .send(validLogin)
    .expect(200)
    .expect('Content-Type', /json/)
    .then((res) => {
      expect(res).toBeDefined();
      expect(res.body).toBeDefined();
      expect(res.body.name).toEqual('Molly');
      expect(res.body.accessToken).toBeDefined();
    });
});

const invalidLogin = {
  'username': 'molly@books.com',
  'password': 'mollymemb',
};

test('POST Inalid password', async () => {
  await request.post('/v0/login/')
    .send(invalidLogin)
    .expect(401);
});

// SHOULE TEST auth.js LINE 51 BUT IDK CAN'T
test('Valid Login but missing Header', async () => {
  await request.post('/v0/login/').send(validLogin);
  await request.get('/v0/mailbox')
    .set({'Authorization': ''})
    .expect(401);
});

test('Valid Login but Invalid token', async () => {
  await request.post('/v0/login/').send(validLogin);
  await request.get('/v0/mail?mailbox=Hi')
    .set({'Authorization': `Bearer abcd`})
    .expect(403);
});

test('Valid Login but Invalid GET', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  await request.get('/v0/mail?mailbox=Hi')
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(404);
});

test('Valid Login and Valid GET with Inbox', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  await request.get('/v0/mail?mailbox=Inbox')
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(200);
});

test('Valid Login and Valid GET with Sent', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  await request.get('/v0/mail?mailbox=Sent')
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(200);
});

test('Valid Login and Valid GET with Trash', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  await request.get('/v0/mail?mailbox=Trash')
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(200);
});

test('Valid Login and Valid GET with search', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  await request.get('/v0/mail?search=Zerk')
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(200);
});

test('Valid Login and Valid GET with search user name', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  await request.get('/v0/mail?search=Molly')
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(200);
});

test('Valid Login and Valid GET with search user email', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  await request.get('/v0/mail?search=molly%40books.com')
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(200);
});

test('Valid Login and Valid GET with search other email', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  await request.get('/v0/mail?search=ndoogood0%40clickbank.net')
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(200);
});

test('Valid Login and Valid GET with search nonexist email', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  await request.get('/v0/mail?search=ndoogood0%40clickbak.net')
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(404);
});

test('Valid Login and Valid GET with search nonexist name', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  await request.get('/v0/mail?search=lmao')
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(404);
});

test('Valid Login and Valid GET with mailbox and search', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  await request.get('/v0/mail?mailbox=Sent&search=Zerk')
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(200);
});

const annaLogin = {
  'username': 'anna@books.com',
  'password': 'annaadmin',
};

const noMailsLogin = {
  'username': 'nomails@books.com',
  'password': 'nomailpassword',
};

test('Valid Login and Valid GET with nonexist Sent', async () => {
  const login = await request.post('/v0/login/').send(noMailsLogin);
  await request.get('/v0/mail?mailbox=Sent')
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(404);
});

test('Valid Login and Valid GET with id', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  const firstsent = await request.get('/v0/mail?mailbox=Sent')
    .set({'Authorization': `Bearer ${login.body.accessToken}`});
  await request.get('/v0/mail/'+firstsent.body[0].id)
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(200);
});

test('Valid Login and Valid GET with id', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  const firstsent = await request.get('/v0/mail?mailbox=Inbox')
    .set({'Authorization': `Bearer ${login.body.accessToken}`});
  await request.get('/v0/mail/'+firstsent.body[0].id)
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(200);
});

test('Valid Login and GET with Invalid id', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  await request.get('/v0/mail?mailbox=Sent')
    .set({'Authorization': `Bearer ${login.body.accessToken}`});
  await request.get('/v0/mail/abcd')
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(404);
});

test('Valid Login and GET with Nonexist id', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  await request.get('/v0/mail?mailbox=Sent')
    .set({'Authorization': `Bearer ${login.body.accessToken}`});
  await request.get('/v0/mail/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(404);
});

test('GET all mailboxes', async () => {
  const login = await request.post('/v0/login/').send(annaLogin);
  await request.get('/v0/mailbox')
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(200);
});

test('GET all mailboxes', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  await request.get('/v0/mailbox')
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(200);
});

// '/v0/star/:id' markStar->markMail
test('Valid star a mail', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  const firstsent = await request.get('/v0/mail?mailbox=Sent')
    .set({'Authorization': `Bearer ${login.body.accessToken}`});
  await request.post('/v0/star/'+firstsent.body[0].id)
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(204);
});

test('Valid star and unstar a mail', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  const firstsent = await request.get('/v0/mail?mailbox=Sent')
    .set({'Authorization': `Bearer ${login.body.accessToken}`});
  await request.post('/v0/star/'+firstsent.body[0].id)
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(204);
  await request.post('/v0/star/'+firstsent.body[0].id)
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(204);
});

test('Invalid star a mail', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  await request.get('/v0/mail?mailbox=Sent')
    .set({'Authorization': `Bearer ${login.body.accessToken}`});
  await request.post('/v0/star/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(404);
});

test('Invalid star a mail with invalid uuid', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  await request.get('/v0/mail?mailbox=Sent')
    .set({'Authorization': `Bearer ${login.body.accessToken}`});
  await request.post('/v0/star/aaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(404);
});

// '/v0/read/:id' markRead->markMail
test('Valid unread a mail', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  const firstsent = await request.get('/v0/mail?mailbox=Sent')
    .set({'Authorization': `Bearer ${login.body.accessToken}`});
  await request.post('/v0/read/'+firstsent.body[0].id)
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(204);
});

test('Valid unread and read a mail', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  const firstsent = await request.get('/v0/mail?mailbox=Sent')
    .set({'Authorization': `Bearer ${login.body.accessToken}`});
  await request.post('/v0/read/'+firstsent.body[0].id)
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(204);
  await request.post('/v0/read/'+firstsent.body[0].id)
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(204);
});

test('Invalid unread a mail', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  await request.get('/v0/mail?mailbox=Sent')
    .set({'Authorization': `Bearer ${login.body.accessToken}`});
  await request.post('/v0/read/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(404);
});

test('Invalid unread a mail with invalid uuid', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  await request.get('/v0/mail?mailbox=Sent')
    .set({'Authorization': `Bearer ${login.body.accessToken}`});
  await request.post('/v0/read/aaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(404);
});

// '/v0/mail/:id' put->moveMail
test('Valid move a id to Inbox', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  const firstsent = await request.get('/v0/mail?mailbox=Trash')
    .set({'Authorization': `Bearer ${login.body.accessToken}`});
  await request.put('/v0/mail/'+firstsent.body[0].id+'?mailbox=Inbox')
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(204);
});

test('Valid move a id to the same mailbox', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  const firstsent = await request.get('/v0/mail?mailbox=Trash')
    .set({'Authorization': `Bearer ${login.body.accessToken}`});
  await request.put('/v0/mail/'+firstsent.body[0].id+'?mailbox=Trash')
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(204);
});

test('Invalid move a id to Sent', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  const firstsent = await request.get('/v0/mail?mailbox=Inbox')
    .set({'Authorization': `Bearer ${login.body.accessToken}`});
  await request.put('/v0/mail/'+firstsent.body[0].id+'?mailbox=Sent')
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(409);
});

test('Move nonexist id to Inbox', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  await request
    .put('/v0/mail/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa?mailbox=Inbox')
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(404);
});

test('Move invalid uuid to Inbox', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  await request
    .put('/v0/mail/aaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa?mailbox=Inbox')
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(404);
});

const newmail = {
  'subject': 'new',
  'content': 'NEW MAIL',
  'to': {
    'name': 'Muhammad Caistor',
    'email': 'mcaistor0@google.nl',
  },
};

// '/v0/mail' post->insertMail
test('Valid post a new mail and selectMails', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  await request.post('/v0/mail')
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .send(newmail)
    .expect(201);
  await request.get('/v0/mail?mailbox=Sent')
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(200);
});

test('GET Starred mails', async () => {
  const login = await request.post('/v0/login/').send(validLogin);
  await request.get('/v0/mail?mailbox=Starred')
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(200);
});

test('GET Starred mails but empty', async () => {
  const login = await request.post('/v0/login/').send(noMailsLogin);
  await request.get('/v0/mail?mailbox=Starred')
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(404);
});

test('GET Starred mails but empty', async () => {
  const login = await request.post('/v0/login/').send(noMailsLogin);
  await request.get('/v0/mail')
    .set({'Authorization': `Bearer ${login.body.accessToken}`})
    .expect(404);
});

