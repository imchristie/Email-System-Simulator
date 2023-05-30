import React from 'react';
import {useContext} from 'react';
import SharedContext from './SharedContext';
import {AppBar, Toolbar, IconButton, Box, List, ListItem, ListItemText,
  ListItemIcon, Dialog, DialogTitle, DialogContent, FormControlLabel,
  Checkbox, FormGroup} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import CloseIcon from '@mui/icons-material/Close';

const fetchMailbox = (setOMB) => {
  const user = JSON.parse(localStorage.getItem('user'));
  fetch('http://localhost:3010/v0/mailbox', {
    method: 'get',
    headers: new Headers({
      'Authorization': `Bearer ${user.accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw response;
      }
      return response.json();
    })
    .then((json) => {
      const arr = (json.filter((m) => ((m.mailbox !== 'Draft')&&
        (m.mailbox !== 'Inbox')&&(m.mailbox !== 'Sent')&&
        (m.mailbox !== 'Starred')&&(m.mailbox !== 'Trash'))));
      setOMB(arr);
    })
    .catch((error) => {
      console.log(error);
    });
};

const fetchMail = (setMail, setS, mailid) => {
  const user = JSON.parse(localStorage.getItem('user'));
  // const bearerToken = user.accessToken;
  const fetchStr = 'http://localhost:3010/v0/mail/'+ mailid;
  fetch(fetchStr, {
    method: 'get',
    headers: new Headers({
      'Authorization': `Bearer ${user.accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw response;
      }
      return response.json();
    })
    .then((json) => {
      setMail(json);
      setS(json.star);
    })
    .catch((error) => {
      console.log(error);
      setMail({});
    });
};

const fetchStar = (id) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const fetchStr = 'http://localhost:3010/v0/star/'+ id;
  fetch(fetchStr, {
    method: 'post',
    headers: new Headers({
      'Authorization': `Bearer ${user.accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw response;
      }
      return true;
    })
    .catch((error) => {
      console.log(error);
    });
};

const fetchUnread = (id) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const fetchStr = 'http://localhost:3010/v0/read/'+ id;
  fetch(fetchStr, {
    method: 'post',
    headers: new Headers({
      'Authorization': `Bearer ${user.accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw response;
      }
      return true;
    })
    .catch((error) => {
      console.log(error);
    });
};

const fetchMove = (id, mailbox) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const fetchStr = 'http://localhost:3010/v0/mail/'+ id+'?mailbox='+mailbox;
  fetch(fetchStr, {
    method: 'put',
    headers: new Headers({
      'Authorization': `Bearer ${user.accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw response;
      }
      return true;
    })
    .catch((error) => {
      console.log(error);
    });
};

const fetchDel = (id) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const fetchStr = 'http://localhost:3010/v0/mail/'+id+'?mailbox=Trash';
  fetch(fetchStr, {
    method: 'put',
    headers: new Headers({
      'Authorization': `Bearer ${user.accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw response;
      }
      return true;
    })
    .catch((error) => {
      console.log(error);
    });
};


/**
 * @return {object} JSX
 */
function MailView() {
  const [mail, setMail] = React.useState({from: {name: '', email: ''}});
  const {mailid, setMailid, setMailV,
    setComp, setMailboxV} = useContext(SharedContext);
  const [starred, setS] = React.useState(0);
  const [dd, setDD] = React.useState(false);
  const [xsmdlg, setXS] = React.useState(((window.innerWidth>550)||
    (window.innerWidth===0))? false : true);
  const [otherMB, setOMB] = React.useState([]);


  React.useEffect(() => {
    fetchMail(setMail, setS, mailid);
    const updateXS = () => {
      const x = ((window.innerWidth>550)||
        (window.innerWidth===0))? false : true;
      setXS(x);
    };
    window.addEventListener('resize', updateXS);
    return () => window.removeEventListener('resize', updateXS);
  }, [mailid]);

  const goBack = () => {
    if (mail.unread === 1) {
      fetchUnread(mailid);
    }
    setMailboxV(true);
    setMailV(false);
    setMailid('');
  };

  const compClicked = () => {
    setMailV(false);
    setComp(true);
  };

  const clickedStar = (id) => {
    fetchStar(id);
    if (starred === 1) {
      setS(0);
    } else {
      setS(1);
    }
  };

  const markUnread = (read, id) => {
    if (read === 0) {
      fetchUnread(id);
    }
    setMailV(false);
    setMailboxV(true);
  };

  const deleteMail = (id) => {
    fetchDel(id);
    setMailV(false);
    setMailboxV(true);
  };

  const moving = () => {
    fetchMailbox(setOMB);
    setDD(true);
  };

  const closeMoving = () => {
    setDD(false);
  };

  const moveTrash = (id) => {
    fetchDel(id);
  };

  const moveInbox = (id) => {
    fetchMove(id, 'Inbox');
  };

  const moveMB = (event, id, mailbox) => {
    if (event.target.checked) {
      fetchMove(id, mailbox);
    }
  };

  return (
    <Box sx={{paddingLeft: (xsmdlg?'0px':'200px')}}>
      <AppBar sx={{paddingLeft: (xsmdlg?'0px':'200px'), background: 'white'}}>
        <Toolbar sx={{justifyContent: 'space-between'}}>
          <IconButton
            onClick={() => goBack()}
            role='button'
            aria-label='go back'>
            <ArrowBackIosNewIcon />
          </IconButton>
          <div>
            <IconButton
              onClick={() => markUnread(mail.unread, mail.id)}
              role='button'
              aria-label='unread'>
              <MailOutlineIcon />
            </IconButton>
            <IconButton
              onClick={() => moving(mail.id)}
              role='button'
              aria-label='move'>
              <DownloadIcon />
            </IconButton>
            <IconButton
              onClick={() => deleteMail(mail.id)}
              role='button'
              aria-label='delete'>
              <DeleteIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      <Box>
        <Toolbar />
        <h1>{mail.subject}</h1>
        <List>
          <ListItem sx={{justifyContent: 'space-between'}}>
            <ListItemText>{mail.mailbox}</ListItemText>
            <ListItemText align="right"
              primary={
                <IconButton
                  onClick={() => compClicked(mail.id)}
                  role='button'
                  aria-label='compose'>
                  <ArrowBackIcon />
                </IconButton>}/>
          </ListItem>
          <ListItem>
            <ListItem>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <div sx={{justifyContent: 'start'}}>
                <ListItemText align="left">
                  {mail.from.name}&emsp;&emsp;{mail.sent}</ ListItemText>
                <ListItemText align="left">{mail.from.email}</ ListItemText>
              </div>
            </ListItem>
            <div>
              <ListItemText align="right"
                primary={
                  <IconButton
                    onClick={() => clickedStar(mail.id)}
                    role='button'
                    aria-label='starred'>
                    {(starred === 0)&&<StarBorderIcon />}
                    {(starred === 1)&&<StarIcon />}
                  </IconButton>}/>
            </div>
          </ListItem>
          <ListItem>
            {mail.content}
          </ListItem>
        </List>
        {dd&&<Dialog open={dd} onClose={() => closeMoving()}>
          <DialogTitle onClose={() => closeMoving()}>
          Moving to which mailbox?&emsp;
            <IconButton
              onClick={() => closeMoving()}
              role='button'
              aria-label='closeM'>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox
                  onChange={() => moveInbox(mail.id)}/>}
                label='Inbox'
              />
              <FormControlLabel
                control={<Checkbox
                  onChange={() => moveTrash(mail.id)}/>}
                label='Trash'
              />
              {otherMB.map((m) => (
                <FormControlLabel
                  control={<Checkbox
                    onChange={(event) => moveMB(event, mail.id, m.mailbox)}/>}
                  label={m.mailbox}
                />
              ))}
            </FormGroup>
          </DialogContent>
        </Dialog>}
      </Box>
    </Box>
  );
}

export default MailView;
