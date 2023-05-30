import {render, fireEvent, waitFor, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import App from '../App';

test('App Renders', async () => {
  render(<App />);
});

test('Input invalid username and password', async () => {
  const inputU = screen.getByLabelText('username');
  fireEvent.change(inputU, {target: {value: 'molly@books.com'}});
  const inputP = screen.getByLabelText('password');
  fireEvent.change(inputP, {target: {value: 'mollypass'}});
  const submit = screen.getByLabelText('submit');
  fireEvent.click(submit);
  expect(localStorage.getItem('user')).toBe(null);
});

test('Input valid username and password', async () => {
  const inputU = screen.getByLabelText('username');
  fireEvent.change(inputU, {target: {value: 'molly@books.com'}});
  const inputP = screen.getByLabelText('password');
  fireEvent.change(inputP, {target: {value: 'mollypassword'}});
  expect(inputU.value).toBe('molly@books.com');
  expect(inputP.value).toBe('mollypassword');
  const submit = screen.getByLabelText('submit');
  fireEvent.click(submit);
  await waitFor(() => {
    expect(localStorage.getItem('user')).not.toBe(null);
  });
});

test('MailList', async () => {
  // const view = render(<App />);
  expect(screen.getByLabelText('mailboxName').textviewent).toviewain('Inbox');
  const star = screen.getByRole('button', {name: /starred/i});
  fireEvent.click(star);
  const trash = screen.getByRole('button', {name: /Trash/i});
  fireEvent.click(trash);
  const sent = screen.getByRole('button', {name: /Sent/i});
  fireEvent.click(sent);
  const starred = screen.getByRole('button', {name: /Starred/i});
  fireEvent.click(starred);
  const draft = screen.getByRole('button', {name: /Draft/i});
  fireEvent.click(draft);
  const inbox = screen.getByRole('button', {name: /Inbox/i});
  fireEvent.click(inbox);
  const compose = screen.getByRole('button', {name: /compose/i});
  fireEvent.click(compose);
  const goback = screen.getByRole('button', {name: /go back/i});
  fireEvent.click(goback);
  fireEvent.click(compose);
  const toField = screen.getByTestId('to');
  fireEvent.change(toField, {target: {value: 'to-email'}});
  const subField = screen.getByTestId('subject');
  fireEvent.change(subField, {target: {value: 'this is subject'}});
  const conField = screen.getByTestId('viewent');
  fireEvent.change(conField, {target: {value: 'this is viewent'}});
  const senting = screen.getByRole('button', {name: /senting/i});
  fireEvent.click(senting);
});
