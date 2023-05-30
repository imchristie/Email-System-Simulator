import React from 'react';

import MailList from './MailList';
import MailView from './MailView';
import TopBar from './TopBar';
import Composing from './Composing';

import SharedContext from './SharedContext';

/**
 * @return {object} JSX
 */
function Home() {
  const [mailbox, setMailbox] = React.useState('Inbox');
  const [mailid, setMailid] =
    React.useState('');
  const [drawerO, setDrawerO] = React.useState(false);
  const [comp, setComp] = React.useState(false);
  const [mailV, setMailV] = React.useState(false);
  const [mailboxV, setMailboxV] = React.useState(true);

  return (
    <SharedContext.Provider value={{mailbox, setMailbox, mailid,
      setMailid, drawerO, setDrawerO, comp, setComp, mailV, setMailV, mailboxV,
      setMailboxV}}>
      <TopBar />
      {comp&&<Composing />}
      {mailboxV&&<MailList />}
      {mailV&&<MailView />}
    </SharedContext.Provider>
  );
}

export default Home;
