const jwt = require('jsonwebtoken');
const {Pool} = require('pg');
var bcrypt = require('bcrypt');


const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

const secrets = {
  'accessToken': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFubmFAY'+
    'm9va3MuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjA2Mjc3MDAxLCJleHAiOjE2MDYy'+
    'NzcwNjF9.1nwY0lDMGrb7AUFFgSaYd4Q7Tzr-BjABclmoKZOqmr4',
};

exports.login = async (req, res) => {
  const {username, password} = req.body;
  const select = 'SELECT * FROM users WHERE username = $1';
  const query = {
    text: select,
    values: [`${username}`],
  };
  const {rows} = await pool.query(query);
  if (rows.length == 1) { // There is
    if (bcrypt.compare(password, rows[0].pw)) {
    const accessToken = jwt.sign(
      {email: rows[0].username, name: rows[0].n},
      secrets.accessToken, {
        expiresIn: '1d',
        algorithm: 'HS256',
      });
    res.status(200).json({name: rows[0].n, accessToken: accessToken});
    }
    else { // There is not or the password doesn't match
      res.status(401).send('Invalid credentials Hi?');
    }
  } else { // There is not or the password doesn't match
    res.status(401).send('Invalid credentials');
  }
};


exports.check = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];
  jwt.verify(token, secrets.accessToken, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};
