import React from 'react';
import SharedContext from './SharedContext';
import {AppBar, Toolbar, IconButton, Box, TextField} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const fetchSent = (t, s, c) => {
  const user = JSON.parse(localStorage.getItem('user'));
  fetch('http://localhost:3010/v0/mail', {
    method: 'post',
    headers: new Headers({
      'Authorization': `Bearer ${user.accessToken}`,
      'Content-Type': 'application/json',
      'accept': 'application/json',
    }),
    body: JSON.stringify({
      'subject': s,
      'content': c,
      'to': {
        'name': '',
        'email': t,
      }}),
  })
    .then((response) => {
      if (!response.ok) {
        throw response;
      }
      return response.json();
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
function Composing() {
  const [too, setTo] = React.useState('');
  const [subject, setSub] = React.useState('');
  const [content, setContent] = React.useState('');
  const {setComp, setMailV, setMailboxV,
    mailid} = React.useContext(SharedContext);
  const [xsmdlg, setXS] = React.useState(((window.innerWidth>550)||
    (window.innerWidth===0))? false : true);

  const goBack = () => {
    setComp(false);
    if (mailid !== '') {
      setMailV(true);
    } else {
      setMailboxV(true);
    }
  };

  React.useEffect(() => {
    const updateXS = () => {
      const x = ((window.innerWidth>550)||
        (window.innerWidth===0))? false : true;
      setXS(x);
    };
    window.addEventListener('resize', updateXS);
    return () => window.removeEventListener('resize', updateXS);
  }, []);

  const senting = () => {
    fetchSent(too, subject, content);
    setComp(false);
    if (mailid !== '') {
      setMailV(true);
    } else {
      setMailboxV(true);
    }
  };

  return (
    <Box sx={{paddingLeft: (xsmdlg?'0px':'200px')}}>
      <AppBar position='fixed' sx={{paddingLeft: (xsmdlg?'0px':'200px')}}>
        <Toolbar sx={{justifyContent: 'space-between'}}>
          <IconButton
            onClick={() => goBack()}
            role='button'
            aria-label='go back'>
            <ArrowBackIosNewIcon />
          </IconButton>
          <div>
            <IconButton
              onClick={() => senting()}
              role='button'
              aria-label='senting'>
              <ArrowForwardIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <TextField
        role='textbox'
        margin="normal"
        placeholder="example@gmail.com"
        id="to"
        name="to"
        size='small'
        inputProps={{'data-testid': 'to'}}
        value={too}
        onInput={(event) => {
          setTo(event.target.value);
        }}
        fullWidth
        sx={{background: 'white'}}
      />
      <TextField
        role='textbox'
        margin="normal"
        placeholder="subject"
        id="subject"
        name="subject"
        size='small'
        inputProps={{'data-testid': 'subject'}}
        value={subject}
        onInput={(event) => {
          setSub(event.target.value);
        }}
        fullWidth
        sx={{background: 'white'}}
      />
      <TextField
        role='textbox'
        margin="normal"
        placeholder="Content"
        id="content"
        name="content"
        inputProps={{'data-testid': 'content'}}
        value={content}
        onInput={(event) => {
          setContent(event.target.value);
        }}
        fullWidth
        multiline
        sx={{background: 'white'}}
      />
    </Box>
  );
}

export default Composing;
