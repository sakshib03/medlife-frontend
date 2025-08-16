import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import "./css_files/SignUp.css";
import sidelogo from "../assets/signup.png";
import medlife from "../assets/v987-18a-removebg-preview.png";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [mobileFocused, setMobileFocused] = useState(false);
  const navigate = useNavigate();


  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Mobile number validation function
  const validateMobile = (mobile) => {
    const mobileRegex = /^[0-9]{10}$/; 
    if (!mobileRegex.test(mobile)) {
      return "Please enter a valid 10-digit mobile number";
    }
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Final validations before API call
    if (!validateEmail(email)) {
      setEmailError("Invalid email format");
      return; // Stop submission
    }

    const mobileValidationError = validateMobile(mobile);
    if (mobileValidationError) {
      setMobileError(mobileValidationError);
      return; // Stop submission
    }

    try {
      const response = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, mobile })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Signup successful!', {
          position: "top-right",
          autoClose: 2000,
          onClose: () => navigate("/login")
        });
      } else {
        toast.error(data.detail || 'Signup failed.', { autoClose: 2000 });
      }
    } catch (error) {
      toast.error('An error occurred. Please try again later.', { autoClose: 2000 });
    }
  };

  return (
    <div className="background-content">
      <ToastContainer
        position="top-right"
        autoClose={2000}
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
          <form onSubmit={handleSubmit}>
            <br />
            <label htmlFor="username" style={{ color: "gray", fontSize: "14px" }}>
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label htmlFor="email" style={{ color: "gray", fontSize: "14px" }}>
              Email address
            </label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (validateEmail(e.target.value)) {
                  setEmailError(""); // Clear error when email is valid
                } else if (emailFocused) {
                  setEmailError("Invalid email format");
                }
              }}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => {
                setEmailFocused(false);
                if (!validateEmail(email)) {
                  setEmailError("Invalid email format");
                } else {
                  setEmailError(""); // Clear error when email is valid
                }
              }}
              required
            />
            {(emailFocused || emailError) && (
              <p style={{ color: emailError ? "red" : "green", fontSize: "12px" }}>
                {emailError}
              </p>
            )}

            <label htmlFor="mobile" style={{ color: "gray", fontSize: "14px" }}>
              Mobile Number
            </label>
            <input
              type="tel"
              id="mobile"
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value);
                const error = validateMobile(e.target.value);
                if (!error) {
                  setMobileError(""); // Clear error when mobile is valid
                } else if (mobileFocused) {
                  setMobileError(error);
                }
              }}
              onFocus={() => setMobileFocused(true)}
              onBlur={() => {
                setMobileFocused(false);
                const error = validateMobile(mobile);
                if (error) {
                  setMobileError(error);
                } else {
                  setMobileError(""); // Clear error when mobile is valid
                }
              }}
              required
              maxLength="10"
              pattern="[0-9]{10}"
            />
            {(mobileFocused || mobileError) && (
              <p style={{ color: mobileError ? "red" : "green", fontSize: "12px" }}>
                {mobileError}
              </p>
            )}

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
              <a 
                style={{ color: "blue" }} 
                className="sign-up" 
                onClick={() => navigate("/login")}
              >
                Log in
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