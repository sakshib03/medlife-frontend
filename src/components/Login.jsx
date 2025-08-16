import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./css_files/SignUp.css";
import sidelogo from "../assets/signup.png";
import medlife from "../assets/v987-18a-removebg-preview.png";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [login, setLogin] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1 = enter login, 2 = enter OTP
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  // Validation functions
  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const isValidPhone = (phone) => {
    const re = /^[0-9]{10}$/;
    return re.test(phone);
  };

  const validateLoginInput = () => {
    if (!login.trim()) {
      toast.error("Please enter your email or phone number");
      return false;
    }
    
    if (login.includes("@")) {
      if (!isValidEmail(login)) {
        toast.error("Please enter a valid email address");
        return false;
      }
    } else {
      if (!isValidPhone(login)) {
        toast.error("Please enter a valid 10-digit phone number");
        return false;
      }
    }
    
    return true;
  };

  const handleRequestOTP = async (event) => {
    event.preventDefault();
    
    if (!validateLoginInput()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/medlifeV21/generate-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("OTP sent successfully!");
        setOtpSent(true);
        setStep(2);
        // Start 1-minute countdown
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) clearInterval(timer);
            return prev - 1;
          });
        }, 1000);
      } else {
        toast.error(data.detail || "Failed to send OTP");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (event) => {
    event.preventDefault();
    
    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/medlifeV21/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        authLogin(data.email, data.access_token);
        toast.success("Login successful!", {
          onClose: () => navigate("/disclaimer"),
        });
      } else {
        toast.error(data.detail || "Invalid OTP");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="background-content">
      <ToastContainer />
      <header>
        <div className="header-left">
          <img src={medlife} alt="MedLife AI Logo" className="logo" />
          <div>
            <h1 className="title">MedLife AI</h1>
          </div>
        </div>
      </header>

      <div className="container" style={{ maxHeight: "380px" }}>
        <div className="form-container">
          <h1>Login to Medlife.ai</h1>
          
          <div style={{marginTop:"25px"}}>
          {step === 1 ? (
             <form onSubmit={handleRequestOTP}>
              <label htmlFor="login" style={{ color: "gray", fontSize: "14px" }}>
                Mobile Number or Email
              </label>
              <input
                type="text"
                id="login"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
              />
              
              <button 
                type="submit" 
                className="sign-in-btn"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Request OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <p style={{ marginBottom: "20px", fontSize:"14px", marginTop:"10px"}}>
                OTP sent to {login}. Please check your {login.includes("@") ? "email" : "phone"}.
              </p>
              
              <label htmlFor="otp" style={{ color: "gray", fontSize: "14px" }}>
                Enter OTP
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength="6"
                inputMode="numeric"
                pattern="\d{6}"
              />
              
              {countdown > 0 && (
                <p style={{ fontSize: "12px", color: "gray" }}>
                  OTP expires in {Math.floor(countdown / 60)}:
                  {(countdown % 60).toString().padStart(2, '0')}
                </p>
              )}
              
              <button 
                type="submit" 
                className="sign-in-btn"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </button>
              
              {countdown <= 0 && (
                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    color: "blue",
                    cursor: "pointer",
                    marginTop: "10px",
                    fontSize:"14px"
                  }}
                  onClick={handleRequestOTP}
                >
                  Resend OTP
                </button>
              )}
            </form>
           
            
          )}
          </div>

          <p style={{ color: "gray", marginTop: "20px" }}>
            Don't have an account?{" "}
            <button
              type="button"
              style={{
                color: "blue",
                background: "none",
                border: "none",
                padding: 0,
                textDecoration: "underline",
                cursor: "pointer",
              }}
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </button>
          </p>
        </div>
        
        <div className="illustration">
          <img src={sidelogo} alt="Doctor Illustration" />
        </div>
      </div>
    </div>
  );
};

export default Login;