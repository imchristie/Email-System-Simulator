import React from 'react';
import {useNavigate} from 'react-router-dom';

/**
 * @return {object} JSX
 */
function Login() {
  const [user, setUser] = React.useState({username: '', password: ''});
  const history = useNavigate();

  const handleInputChange = (event) => {
    const {value, name} = event.target;
    const u = user;
    u[name] = value;
    setUser(u);
  };

  const onSubmit = (event) => {
    event.preventDefault();
    fetch('http://localhost:3010/v0/login', {
      method: 'POST',
      body: JSON.stringify(user),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw res;
        }
        return res.json();
      })
      .then((json) => {
        localStorage.setItem('user', JSON.stringify(json));
        history('/');
      })
      .catch((err) => {
        alert('Error logging in, please try again');
      });
  };

  return (
    <form onSubmit={onSubmit}>
      <h2 id='welcome'>Login</h2>
      <input
        type="username"
        name="username"
        aria-label='username'
        placeholder="Username"
        onChange={handleInputChange}
        required
      />
      <input
        type="password"
        name="password"
        aria-label='password'
        placeholder="Password"
        onChange={handleInputChange}
        required
      />
      <input type="submit" aria-label='submit' value="Sign in"/>
    </form>
  );
}

export default Login;
