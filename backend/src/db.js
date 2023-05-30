const {Pool} = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

const emailRe = new RegExp('' +
  /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\./.source +
  /([a-zA-Z]{2,5})(\.([a-zA-Z]{2,5}))?$/gi.source);

/**
 * To sort the elements with the date from newest
 * @param {date} a
 * @param {date} b
 * @return {integer}
 */
function sortDate(a, b) {
  return a.date > b.date? -1:1;
}

/**
 * @param {number} d
 * @return {boolean}
 */
function last12(d) {
  const today = new Date();
  const m = d.getMonth();
  const y = d.getFullYear();
  const diff = (((y-today.getFullYear())*12)-today.getMonth()+m);
  if ((diff>12)||(diff<-12)) {
    return false;
  } else {
    return true;
  }
}

/**
 * @param {array} mails
 * @return {array}
 */
function sortedMail(mails) {
  const mail1 = mails
    .map((ml) => ({
      'star': ml.star,
      'unread': ml.unread,
      'name': ml.name,
      'id': ml.id,
      'to': ml.to,
      'from': ml.from,
      'date': new Date(ml.received),
      'content': ml.content,
      'subject': ml.subject,
      'received': ml.received,
    }));
  mail1.sort(sortDate);
  const today = new Date();
  const todayE = mail1
    .filter((email) => ((email.date.getDate()===today.getDate())&&
      (email.date.getMonth()===today.getMonth())&&
      (email.date.getFullYear()===today.getFullYear())))
    .map((email) => ({
      star: email.star,
      unread: email.unread,
      id: email.id,
      received: email.received,
      date: email.date,
      subject: email.subject,
      from: email.from,
      to: email.to,
      content: email.content,
      name: email.name,
      sent: '',
    }));
  for (let i = 0; i < todayE.length; i++) {
    todayE[i].sent = todayE[i].date.toLocaleTimeString('en-US')
      .replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, '$1$3');
    delete todayE[i].date;
    mail1.shift();
  }
  today.setDate(today.getDate()-1);
  const yesterdayE = mail1
    .filter((email) => ((email.date.getDate()===today.getDate())&&
      (email.date.getMonth()===today.getMonth())&&
      (email.date.getFullYear()===today.getFullYear())))
    .map((email) => ({
      star: email.star,
      unread: email.unread,
      id: email.id,
      received: email.received,
      subject: email.subject,
      from: email.from,
      to: email.to,
      content: email.content,
      name: email.name,
      sent: 'Yesterday',
    }));
  for (let i = 0; i < yesterdayE.length; i++) {
    mail1.shift();
  }
  const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May',
    'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const last12E = mail1
    .filter((email) => (last12(email.date)))
    .map((email) => ({
      star: email.star,
      unread: email.unread,
      id: email.id,
      received: email.received,
      sent: ((email.date.getDate()<10)? (mon[email.date.getMonth()]+
      ' 0'+email.date.getDate()):
        (mon[email.date.getMonth()]+' '+email.date.getDate())),
      subject: email.subject,
      from: email.from,
      to: email.to,
      content: email.content,
      name: email.name,
    }));
  for (let i = 0; i < last12E.length; i++) {
    mail1.shift();
  }
  const otherE = mail1
    .map((email) => ({
      star: email.star,
      unread: email.unread,
      id: email.id,
      received: email.received,
      sent: (email.date.getFullYear()).toString(),
      subject: email.subject,
      from: email.from,
      to: email.to,
      content: email.content,
      name: email.name,
    }));
  const a = todayE.concat(yesterdayE, last12E, otherE);
  return a;
}

exports.selectMails = async (email, mailbox, search) => {
  if (search) {
    if (search.match(emailRe)) {
      let select;
      if (search != email) {
        select = `SELECT id, mailbox, mail FROM mail`+
        ` WHERE (mail->'from'->>'email' = $1 AND mail->'to'->>'email' = $2)`+
        ` OR (mail->'to'->>'email' = $1 AND mail->'from'->>'email' = $2)`;
      } else {
        select = `SELECT id, mailbox, mail FROM mail`+
      ` WHERE mail->'from'->>'email' = $1 OR mail->'to'->>'email' = $2`;
      }
      const query ={
        text: select,
        values: [`${email}`, `${search}`],
      };
      const {rows} = await pool.query(query);
      let mails = [];
      for (const row of rows) {
        mails.push(row);
      }
      if (mails.length == 0) {
        return [];
      }
      mails = mails.map((ml) => ({
        'star': ml.mail.star,
        'unread': ml.mail.unread,
        'name': (ml.mail.to.email == email?
          ml.mail.from.name: ml.mail.to.name),
        'id': ml.id,
        'to': ml.mail.to,
        'from': ml.mail.from,
        'content': ml.mail.content,
        'subject': ml.mail.subject,
        'received': ml.mail.received,
      }));
      return sortedMail(mails);
    } else {
      const select = `SELECT id, mailbox, mail FROM mail`+
        ` WHERE (mail->'to'->>'email' = $1 AND (mail->'from'->>'email' ~* $2`+
        ` OR mail->'from'->>'name' ~* $2 OR mail->>'subject' ~* $2 OR`+
        ` mail->>'content' ~* $2 OR mail->'to'->>'name' ~* $2))`+
        ` OR (mail->'from'->>'email' = $1 AND (mail->'to'->>'email' ~* $2`+
        ` OR mail->'to'->>'name' ~* $2 OR mail->>'subject' ~* $2 OR`+
        ` mail->>'content' ~* $2 OR mail->'from'->>'name' ~* $2))`;
      const query ={
        text: select,
        values: [`${email}`, `${search}`],
      };
      const {rows} = await pool.query(query);
      let mails = [];
      for (const row of rows) {
        mails.push(row);
      }
      if (mails.length == 0) {
        return [];
      }
      mails = mails.map((ml) => ({
        'star': ml.mail.star,
        'unread': ml.mail.unread,
        'name': (ml.mail.to.email == email?
          ml.mail.from.name: ml.mail.to.name),
        'id': ml.id,
        'to': ml.mail.to,
        'from': ml.mail.from,
        'content': ml.mail.content,
        'subject': ml.mail.subject,
        'received': ml.mail.received,
      }));
      return sortedMail(mails);
    }
  } else if (mailbox == 'Starred') {
    const select = `SELECT id, mailbox, mail FROM mail`+
      ` WHERE (mail->'from'->>'email' = $1 OR mail->'to'->>'email' = $1)`+
      ` AND mail->>'star' = '1'`;
    const query = {
      text: select,
      values: [`${email}`],
    };
    const {rows} = await pool.query(query);
    let mails = [];
    for (const row of rows) {
      mails.push(row);
    }
    if (mails.length == 0) {
      return [];
    }
    mails = mails.map((ml) => ({
      'star': ml.mail.star,
      'unread': ml.mail.unread,
      'name': (ml.mail.to.email == email?
        ml.mail.from.name: ml.mail.to.name),
      'id': ml.id,
      'to': ml.mail.to,
      'from': ml.mail.from,
      'content': ml.mail.content,
      'subject': ml.mail.subject,
      'received': ml.mail.received,
    }));
    return sortedMail(mails);
  } else if (mailbox == 'Sent') {
    const select = `SELECT id, mailbox, mail FROM mail`+
      ` WHERE mail->'from'->>'email' = $1 AND mailbox = 'Sent'`;
    const query = {
      text: select,
      values: [`${email}`],
    };
    const {rows} = await pool.query(query);
    let mails = [];
    for (const row of rows) {
      mails.push(row);
    }
    if (mails.length == 0) {
      return [];
    }
    mails = mails.map((ml) => ({
      'star': ml.mail.star,
      'unread': ml.mail.unread,
      'name': ml.mail.to.name,
      'id': ml.id,
      'to': ml.mail.to,
      'from': ml.mail.from,
      'content': ml.mail.content,
      'subject': ml.mail.subject,
      'received': ml.mail.received,
    }));
    return sortedMail(mails);
  } else if (mailbox) {
    const select = `SELECT id, mailbox, mail FROM mail`+
      ` WHERE mail->'to'->>'email' = $1 AND mailbox = $2`;
    const query = {
      text: select,
      values: [`${email}`, `${mailbox}`],
    };
    const {rows} = await pool.query(query);
    let mails = [];
    for (const row of rows) {
      mails.push(row);
    }
    if (mails.length == 0) {
      return [];
    }
    mails = mails.map((ml) => ({
      'star': ml.mail.star,
      'unread': ml.mail.unread,
      'name': ml.mail.from.name,
      'id': ml.id,
      'to': ml.mail.to,
      'from': ml.mail.from,
      'content': ml.mail.content,
      'subject': ml.mail.subject,
      'received': ml.mail.received,
    }));
    return sortedMail(mails);
  } else {
    return [];
  }
};

exports.selectMail = async (email, id) => {
  const select = 'SELECT id, mailbox, mail FROM mail WHERE id = $1';
  const query = {
    text: select,
    values: [`${id}`],
  };
  const {rows} = await pool.query(query);
  if (rows.length == 1) {
    let mail = [{
      star: rows[0].mail.star,
      unread: rows[0].mail.unread,
      name: (rows[0].mail.to.email == email?
        rows[0].mail.from.name: rows[0].mail.to.name),
      id: rows[0].id,
      to: rows[0].mail.to,
      from: rows[0].mail.from,
      subject: rows[0].mail.subject,
      content: rows[0].mail.content,
      received: rows[0].mail.received,
    }];
    mail = sortedMail(mail)[0];
    mail.mailbox = rows[0].mailbox;
    return mail;
  } else {
    return undefined;
  }
};

exports.markMail = async (str, id) => {
  const select = 'SELECT mail FROM mail WHERE id = $1';
  const query = {
    text: select,
    values: [`${id}`],
  };
  const {rows} = await pool.query(query);
  if (rows.length == 1) {
    let update;
    let s;
    if (str == 's') {
      s = (rows[0].mail.star == 1)? '0':'1';
      update = `UPDATE mail SET mail = `+
        `jsonb_set(mail, '{star}', $1) WHERE id = $2`;
    } else {
      s = (rows[0].mail.unread == 1)? '0':'1';
      update = `UPDATE mail SET mail = `+
        `jsonb_set(mail, '{unread}', $1) WHERE id = $2`;
    }
    const q = {
      text: update,
      values: [`${s}`, `${id}`],
    };
    pool.query(q);
    return 204;
  } else {
    return undefined;
  }
};

exports.allMailboxes = async (email) => {
  // draft
  let select = `SELECT mailbox, mail FROM mail`+
    ` WHERE mail->'from'->>'email' = $1 AND mailbox = 'Draft'`;
  let query = {
    text: select,
    values: [`${email}`],
  };
  const {rows} = await pool.query(query);
  const mailboxes = [];
  mailboxes.push({mailbox: 'Draft', count: rows.length});
  // starred
  select = `SELECT mailbox, mail FROM mail WHERE mail->>'star' = '1' `+
    `AND (mail->'from'->>'email' = $1 OR mail->'to'->>'email' = $1)`;
  query = {
    text: select,
    values: [`${email}`],
  };
  const a = await pool.query(query);
  mailboxes.push({mailbox: 'Starred', count: a.rows.length});
  // others
  select = `SELECT mailbox, mail FROM mail WHERE mail->>'unread' = '1'`+
  ` AND (mail->'from'->>'email' = $1 OR mail->'to'->>'email' = $1)`;
  query = {
    text: select,
    values: [`${email}`],
  };
  let counts = [];
  const names = [];
  const b = await pool.query(query);
  for (const row of b.rows) {
    if (names.indexOf(row.mailbox) == -1) {
      names.push(row.mailbox);
      counts.push(1);
    } else {
      counts[names.indexOf(row.mailbox)]++;
    }
  }
  for (let i = 0; i < names.length; i++) {
    mailboxes.push({mailbox: names[i], count: counts[i]});
  }
  // others user-created mailboxes with no unread mail
  select = `SELECT mailbox, mail FROM mail WHERE mail->>'unread' = '0'`+
  ` AND (mail->'from'->>'email' = $1 OR mail->'to'->>'email' = $1)`;
  query = {
    text: select,
    values: [`${email}`],
  };
  counts = [];
  const n = [];
  const c = await pool.query(query);
  for (const row of c.rows) {
    if (names.indexOf(row.mailbox) == -1) {
      n.push(row.mailbox);
      counts.push(1);
    } else {
      counts[names.indexOf(row.mailbox)]++;
    }
  }
  for (let i = 0; i < n.length; i++) {
    if ((n[i]!=='Inbox')&&(n[i]!=='Sent')&&(n[i]!=='Draft')&&(n[i]!=='Trash')) {
      mailboxes.push({mailbox: n[i], count: 0});
    }
  }
  return mailboxes;
};

exports.moveMail = async (id, mailbox) => {
  const select = 'SELECT id, mailbox, mail FROM mail WHERE id = $1';
  const query = {
    text: select,
    values: [`${id}`],
  };
  const {rows} = await pool.query(query);
  if (rows.length == 0) {
    return -1;
  } else if ((rows[0].mailbox != 'Sent')&&(mailbox == 'Sent')) {
    return 1;
  } else if (rows[0].mailbox == mailbox) {
    return 204;
  } else {
    const update = 'UPDATE mail SET mailbox = $1 WHERE id = $2';
    const q = {
      text: update,
      values: [`${mailbox}`, `${id}`],
    };
    pool.query(q);
    return 204;
  }
};

exports.insertMail = async (email, mail) => {
  const select = `SELECT mail FROM mail WHERE (mail->'to'->>'email' = $1`+
    ` AND (mailbox != 'Sent'))`;
  const q = {
    text: select,
    values: [`${email}`],
  };
  const {rows} = await pool.query(q);
  const fromN = rows[0].mail.to.name;
  const received = new Date();
  const s = received.toISOString();
  const str = s.replace(/.[0-9]{3}Z/, 'Z');
  const insertM = {
    star: 0,
    unread: 0,
    from: {name: fromN, email: email},
    to: mail.to,
    subject: mail.subject,
    received: str,
    sent: str,
    content: mail.content,
  };

  const insert = `INSERT INTO mail(mailbox, mail)`+
    `VALUES ('Sent', $1) RETURNING id`;
  const query = {
    text: insert,
    values: [insertM],
  };
  const id = await pool.query(query);
  return {
    star: 0,
    unread: 0,
    mailbox: 'Sent',
    name: insertM.from.name,
    id: id.rows[0].id,
    to: mail.to,
    from: insertM.from,
    subject: mail.subject,
    content: mail.content,
    sent: str,
    received: str,
  };
};


console.log(`Connected to database '${process.env.POSTGRES_DB}'`);
