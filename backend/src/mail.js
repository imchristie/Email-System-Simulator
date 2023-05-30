const db = require('./db');

const uuid = new RegExp('' +
  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-/.source +
  /[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.source);

// req.user = {email: molly@books.com, name: Molly}
exports.getAll = async (req, res) => {
  const mails = await db.selectMails(req.user.email,
    req.query.mailbox, req.query.search);
  if (mails.length != 0) {
    res.status(200).json(mails);
  } else {
    res.status(404).send();
  }
};


exports.getById = async (req, res) => {
  if (req.params.id.match(uuid)) {
    const mail = await db.selectMail(req.user.email, req.params.id);
    if (mail) {
      res.status(200).json(mail);
    } else {
      res.status(404).send();
    }
  } else {
    res.status(404).send();
  }
};

exports.getMailboxes= async (req, res) => {
  const mailboxes = await db.allMailboxes(req.user.email);
  res.status(200).json(mailboxes);
};

exports.markStar = async (req, res) => {
  if (req.params.id.match(uuid)) {
    const mail = await db.markMail('s', req.params.id);
    if (mail) {
      res.status(204).send();
    } else {
      res.status(404).send();
    }
  } else {
    res.status(404).send();
  }
};

exports.markRead = async (req, res) => {
  if (req.params.id.match(uuid)) {
    const mail = await db.markMail('r', req.params.id);
    if (mail) {
      res.status(204).send();
    } else {
      res.status(404).send();
    }
  } else {
    res.status(404).send();
  }
};

exports.put = async (req, res) => {
  if (req.params.id.match(uuid)) {
    const mail = await db.moveMail(req.params.id, req.query.mailbox);
    if (mail == 1) { // mailbox is sent and mail not in sent
      res.status(409).send();
    } else if (mail == -1) { // id doesn't identify a known email
      res.status(404).send();
    } else {
      res.status(204).send();
    }
  } else {
    res.status(404).send();
  }
};

exports.post = async (req, res) => {
  const newMail = await db.insertMail(req.user.email, req.body);
  res.status(201).send(newMail);
};

/*
exports.insertMB = async (req, res) => {
  const mails = await db.newMailbox(req.params.mb, req.user.email);
  if (mails) {
    res.status(200).json(mails);
  } else {
    res.status(404).send();
  }
};
*/
