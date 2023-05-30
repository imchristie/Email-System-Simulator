import SharedContext from './SharedContext';
import React from 'react';
import {AppBar, Toolbar, IconButton, Box, List, ListItem, ListItemButton,
  TextField, InputAdornment, ListItemText, ListItemIcon, Drawer,
  createTheme, Divider} from '@mui/material';
import DensityMediumIcon from '@mui/icons-material/DensityMedium';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CancelIcon from '@mui/icons-material/Cancel';
import InboxIcon from '@mui/icons-material/Inbox';
import StarIcon from '@mui/icons-material/Star';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DraftsIcon from '@mui/icons-material/Drafts';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';

const fetchMailbox = (setMB, setOMB) => {
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
      const oo = {};
      for (let i = 0; i < json.length; i++) {
        oo[json[i].mailbox] = json[i].count;
      }
      setMB(oo);
      const arr = (json.filter((m) => ((m.mailbox !== 'Draft')&&
        (m.mailbox !== 'Inbox')&&(m.mailbox !== 'Sent')&&
        (m.mailbox !== 'Starred')&&(m.mailbox !== 'Trash'))));
      setOMB(arr);
    })
    .catch((error) => {
      console.log(error);
      setMB([]);
    });
};

const fetchMail = (setMails, searchW) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const str = encodeURIComponent(searchW);
  const fetchStr = 'http://localhost:3010/v0/mail?search='+ str;
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

const drawerWidth = 200;

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
  drawerOpen: {
    '& .MuiDrawer-paper': {
      width: drawerWidth,
      height: '100%',
      flexShrink: 0,
      boxSizing: 'border-box'},
  },
  drawerClose: {
    [theme.breakpoints.up('sm')]: {
      '& .MuiDrawer-paper': {
        width: drawerWidth,
        height: '100%',
        flexShrink: 0,
        boxSizing: 'border-box'},
    },
    [theme.breakpoints.down('sm')]: {
      overflowX: 'hidden',
    },
  },
});

/**
 * @return {object} JSX
 */
function TopBar() {
  const logout = () => {
    localStorage.removeItem('user');
    global.location.assign('http://localhost:3000/login');
  };

  const [mails, setMails] = React.useState([]);
  const [searching, setSearching] = React.useState(false);
  const [searchW, setSearchW] = React.useState('');
  const {setMailbox, drawerO, setMailV, setComp, setMailboxV, mailV, mailboxV,
    setMailid, setDrawerO} = React.useContext(SharedContext);
  // const [currentMb, setCurrentMb] = React.useState('');
  const c = styles(theme);
  const [xsmdlg, setXS] = React.useState(((window.innerWidth>550)||
    (window.innerWidth===0))? false : true);

  const [mailboxes, setMB] = React.useState([]);
  const [otherMB, setOMB] = React.useState([]);
  const startSearching = () => {
    setMailboxV(false);
    setSearching(true);
  };

  React.useEffect(() => {
    fetchMail(setMails, searchW);
    fetchMailbox(setMB, setOMB);
    const updateXS = () => {
      const x = ((window.innerWidth>550)||
        (window.innerWidth===0))? false : true;
      setXS(x);
    };
    window.addEventListener('resize', updateXS);
    return () => window.removeEventListener('resize', updateXS);
  }, [searchW]);

  const clicked = (id) => {
    setMailboxV(false);
    setMailid(id);
    setMailV(true);
  };

  const exitSearching = () => {
    setSearching(false);
    setMailboxV(true);
    setSearchW('');
  };

  const clearSearch = () => {
    setMails([]);
    setSearchW('');
  };

  const compClicked = () => {
    setMailV(false);
    setComp(true);
    setMailboxV(false);
  };

  const mbClicked = (mb) => {
    setComp(false);
    setMailboxV(true);
    setMailbox(mb);
    setMailV(false);
    setDrawerO(false);
  };

  return (
    <Box sx={{display: 'flex'}}>
      <AppBar position='fixed' sx={{paddingLeft: (xsmdlg?'0px':'200px')}}>
        <Toolbar sx={{justifyContent: 'space-between'}}>
          {((!searching)&&(xsmdlg))&&<IconButton
            onClick={() => {
              setDrawerO(true);
            }}
            role='button'
            aria-label='toggle drawer'>
            <DensityMediumIcon />
          </IconButton>}
          {searching&&<IconButton
            onClick={() => exitSearching()}
            role='button'
            aria-label='exit searching'>
            <ArrowBackIosNewIcon />
          </IconButton>}
          <Box sx={{width: '70%'}}>
            <TextField
              margin="normal"
              id="search"
              name="search"
              size='small'
              fullWidth
              value={searchW}
              aria-label='searching'
              sx={{background: 'white'}}
              onClick={() => startSearching()}
              onInput={(event) => {
                setSearchW(event.target.value);
                console.log('mailV', mailV, 'mailboxV', mailboxV);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          {(!searching)&&<div>
            <IconButton
              onClick={() => compClicked()}
              role='button'
              aria-label='compose'>
              <MailOutlineIcon />
            </IconButton>
            <IconButton
              role='button'
              aria-label='logout'
              onClick={logout}>
              <PersonIcon />
            </IconButton>
          </div>}
          {searching&&<div><IconButton
            onClick={() => clearSearch()}
            role='button'
            aria-label='clearSearch'>
            <CancelIcon />
          </IconButton></div>}
        </Toolbar>
      </AppBar>
      <Drawer variant={xsmdlg? 'persistent':'permanent'}
        sx={drawerO? c.drawerOpen:c.drawerClose}
        open={drawerO}>
        <Box sx={{overflow: 'auto'}}>
          <List>
            <ListItem>
              <ListItemText primary='CSE186 Mail'/>
            </ListItem>
            <ListItemButton onClick={() => mbClicked('Inbox')}>
              <ListItemIcon>
                <InboxIcon />
              </ListItemIcon>
              <ListItemText primary='Inbox'/>
              <ListItemText align="right"
                primary={mailboxes['Inbox']}/>
            </ListItemButton>
            <Divider />
            <ListItemButton onClick={() => mbClicked('Starred')}>
              <ListItemIcon>
                <StarIcon />
              </ListItemIcon>
              <ListItemText primary='Starred'/>
              <ListItemText align="right"
                primary={mailboxes['Starred']}/>
            </ListItemButton>
            <ListItemButton onClick={() => mbClicked('Sent')}>
              <ListItemIcon>
                <ArrowCircleRightIcon />
              </ListItemIcon>
              <ListItemText primary='Sent'/>
            </ListItemButton>
            <ListItemButton onClick={() => mbClicked('Draft')}>
              <ListItemIcon>
                <DraftsIcon />
              </ListItemIcon>
              <ListItemText primary='Drafts'/>
            </ListItemButton>
            <ListItemButton onClick={() => mbClicked('Trash')}>
              <ListItemIcon>
                <DeleteOutlineIcon />
              </ListItemIcon>
              <ListItemText primary='Trash'/>
              <ListItemText align="right"
                primary={mailboxes['Trash']}/>
            </ListItemButton>
            <Divider />
            {otherMB.map((m) => (
              <ListItemButton onClick={() => mbClicked(m.mailbox)}>
                <ListItemIcon>
                  <ArrowForwardIcon />
                </ListItemIcon>
                <ListItemText primary={m.mailbox}/>
                {(m.count!==0)&&<ListItemText primary={m.count}/>}
              </ListItemButton>
            ))}
            <Divider />
            <ListItemButton>
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary='New Mailbox'/>
            </ListItemButton>
            <Divider />
          </List>
        </Box>
      </Drawer>
      {searching &&
      <div sx={{flexGrow: 1, overflow: 'auto'}}>
        <Toolbar />
        <List sx={{marginLeft: (xsmdlg?'0px':'200px'),
          width: (xsmdlg? '100%':(window.innerWidth-200))}}>
          {mails.map((item) => (
            <ListItem>
              <ListItemButton aria-label={item.name} role='button'
                sx={{justifyContent: 'space-between'}}
                onClick={() => clicked(item.id)} key={item.id}>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <Box style={{width: (window.innerWidth-(drawerWidth+200))}}>
                  <ListItemText primary={item.name} />
                  <ListItemText primary={item.subject} />
                  <ListItemText
                    primaryTypographyProps={{style: {whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis'}}}
                    primary={item.content} />
                </Box>
                <div>
                  <ListItemText align="right"
                    primary={item.sent}/>
                  <ListItemText align="right"
                    primary={<br/>}/>
                  <ListItemText align="right"
                    primary={
                      <IconButton
                        role='button'
                        aria-label='starred'>
                        <StarBorderIcon />
                      </IconButton>}/>
                </div>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </div>}
    </Box>
  );
}

export default TopBar;
