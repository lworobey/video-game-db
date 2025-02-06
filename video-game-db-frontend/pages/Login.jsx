import './login.css';


const Login = () => {
  console.log('Rendering Login component');

  const handleLogin = () => {
    try {
      console.log('Attempting Discord login redirect...');
      window.location.href = 'http://localhost:3000/auth/login'; //redirect to port 3000 auth login which handles discord login
    } catch (error) {
      console.error('Error during login redirect:', error);
    }
  };

  return(
    <div className="Login container">
      <h1>This is the Login page</h1>
      <div className="login-container">
        <button 
          type="button" 
          className="login-button"
          onClick={handleLogin}
        >
          Login with Discord
        </button>
      </div>
    </div>
  );
};

export default Login;