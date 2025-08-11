import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import "./css_files/SignIn.css";
import sidelogo from "../assets/signup.png";
import medlife from "../assets/v987-18a-removebg-preview.png";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail]= useState("");
  
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const navigate=useNavigate();

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation function
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (password.length < minLength) {
      return "Password must be at least 8 characters long";
    }
    if (!hasUpperCase) {
      return "Password must contain at least one uppercase letter";
    }
    if (!hasLowerCase) {
      return "Password must contain at least one lowercase letter";
    }
    if (!hasNumber) {
      return "Password must contain at least one numeric digit";
    }
    if (!hasSpecialChar) {
      return "Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)";
    }
    return "";
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };



  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:8000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Signup successful!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          draggable: true,
          progress: undefined,
          onClose: () => {
            navigate("/signin");
          }
        });
      } else {
        toast.error(data.detail || 'Signup failed.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      toast.error('An error occurred. Please try again later.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <div className="background-content">

    <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
    />
      <header>
        <div className="header-left">
          <img src={medlife} alt="MedLife AI Logo" className="logo" />
          <div>
            <h1 className="title">MedLife AI</h1>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="form-container">
          <h1>Sign Up to Medlife.ai</h1>
          <p style={{ color: "#6b6a6a" }}>
            Sign Up to Medlife.ai to continue to Application
          </p>
          <form onSubmit={handleSubmit}>
            <br />
            <label
              htmlFor="username"
              style={{ color: "gray", fontSize: "14px" }}
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label
              htmlFor="username"
              style={{ color: "gray", fontSize: "14px" }}
            >
              Email address
            </label>
            <input
              type="text"
              id="email-address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailFocused) {
                  const emailValid = validateEmail(e.target.value);
                  setEmailError(emailValid ? "" : "Invalid email format");
                }
              }}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              required
            />
            {emailFocused && (
              <p style={{ color: "red", fontSize: "12px" }}>
                Please enter a valid email address (e.g. user@example.com)
              </p>
            )}
            {emailError && !emailFocused && (
              <p style={{ color: "red", fontSize: "12px" }}>{emailError}</p>
            )}

          

            <div style={{ position: "relative" }}>
              <label
                htmlFor="password"
                style={{ color: "gray", fontSize: "14px" }}
              >
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordFocused) {
                    const passwordValidationError = validatePassword(e.target.value);
                    setPasswordError(passwordValidationError);
                  }
                }}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                required
                style={{ paddingRight: "30px" }} // Add padding to prevent text under the icon
              />
              {passwordFocused && (
                <p style={{ color: "red", fontSize: "12px" }}>
                  Password must be at least 8 characters long, contain uppercase, lowercase, and special character.
                </p>
              )}
              {passwordError && !passwordFocused && (
                <p style={{ color: "red", fontSize: "12px" }}>{passwordError}</p>
              )}
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "38px", // Adjust based on your layout
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "gray",
                }}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            <a style={{ color: "blue" }} className="forgot">Forgot password</a>
            <button type="submit" className="sign-in-btn">
              Sign Up
            </button>

            {errorMessage && (
              <p className="error-message" style={{ display: "block" }}>
                {errorMessage}
              </p>
            )}

            <p style={{ color: "gray" }}>
              Already have an account?{" "}
              <a style={{ color: "blue" }} 
              className="sign-up" 
              onClick={()=>{
                navigate("/signin")
              }}>
                Sign In
              </a>
            </p>

          </form>
        </div>

        <div className="illustration">
          <img src={sidelogo} alt="Doctor Illustration" />
        </div>
      </div>
    </div>
  );
};

export default SignUp;