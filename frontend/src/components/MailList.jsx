import React from 'react';
import {useContext} from 'react';
import SharedContext from './SharedContext';
import {List, ListItem, IconButton, createTheme,
  ListItemText, Toolbar, ListItemButton, ListItemIcon} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 550,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

const styles = (theme) => ({
  unreadT: {
    fontWeight: 'bold',
    fontSize: 'large',
  },
  readT: {
    fontWeight: 'normal',
  },
});

const fetchMails = (setMails, mailbox) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const fetchStr = 'http://localhost:3010/v0/mail?mailbox='+ mailbox;
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
      setMails(json);
    })
    .catch((error) => {
      console.log(error);
      setMails([]);
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

/**
 * @return {object} JSX Table
 */
function MailList() {
  const c = styles(theme);
  const [mails, setMails] = React.useState([]);
  const {mailbox, setMailid, setMailV, setMailboxV,
    setDrawerO} = useContext(SharedContext);
  const [xsmdlg, setXS] = React.useState(((window.innerWidth>550)||
    (window.innerWidth===0))? false : true);
  // const [star, setStar] = React.useState();

  const clicked = (id) => {
    setMailboxV(false);
    setMailid(id);
    setMailV(true);
  };

  const clickedStar = (e, id) => {
    e.stopPropagation();
    fetchStar(id);
    window.location.reload(false);
  };

  React.useEffect(() => {
    fetchMails(setMails, mailbox);
    const updateXS = () => {
      const x = ((window.innerWidth>550)||
        (window.innerWidth===0))? false : true;
      setXS(x);
    };
    window.addEventListener('resize', updateXS);
    return () => window.removeEventListener('resize', updateXS);
  }, [mailbox]);

  return (
    <div onClick={() => setDrawerO(false)}
      sx={{flexGrow: 1, overflow: 'auto'}}>
      <Toolbar />
      <List aria-label='mail list' sx={{paddingLeft: (xsmdlg?'0px':'200px')}}>
        <h2 aria-label='mailboxName'>&emsp;{mailbox}</h2>
        {mails.map((item) => (
          <ListItem>
            <ListItemButton onClick={() => clicked(item.id)} key={item.id}
              role='button'
              sx={{justifyContent: 'space-between'}} aria-label={item.name}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <div style={{width: '75%'}}>
                <ListItemText
                  primaryTypographyProps={item.unread? c.unreadT: c.readT}
                  primary={item.name} />
                <ListItemText
                  primaryTypographyProps={item.unread? c.unreadT: c.readT}
                  primary={item.subject} />
                <ListItemText
                  primaryTypographyProps={{style: {whiteSpace: 'nowrap',
                    overflow: 'hidden', textOverflow: 'ellipsis'}}}
                  primary={item.content} />
              </div>
              <div>
                <ListItemText align="right"
                  primary={item.sent}/>
                <ListItemText align="right"
                  primary={<br/>}/>
                <ListItemText align="right"
                  primary={
                    <IconButton
                      onClick={(e) => clickedStar(e, item.id)}
                      role='button'
                      aria-label='starred'>
                      {(item.star === 0)&&<StarBorderIcon />}
                      {(item.star === 1)&&<StarIcon />}
                    </IconButton>}/>
              </div>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export default MailList;
