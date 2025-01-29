import './login.css';

const Login = () => {
return(
    <div className="Login container">
    <h1>This is the Login page</h1>
    <input
      type="text" 
      placeholder="login"
      className="login-input"
    />
    <input
      type="text" 
      placeholder="Password"
      className="password-input"
    />
          <div className="login-container">
            <button type="button" className="login-button">
              Login
            </button>
          </div>

    </div>
    );
};
export default Login