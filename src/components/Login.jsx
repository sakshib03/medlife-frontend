import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./css_files/SignUp.css";
import sidelogo from "../assets/signup.png";
import medlife from "../assets/v987-18a-removebg-preview.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../config";

const Login = () => {
  const [login, setLogin] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); 
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  // Validation helpers
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone) => /^\d{10,15}$/.test(phone); // allow 10-15 digits

  // Convert user input into API payload shape
  const getLoginChannel = () => {
    const trimmed = login.trim();
    const isEmail = trimmed.includes("@");
    const type = isEmail ? "email" : "sms";
    const identifier = trimmed;
    return { type, identifier, isEmail };
  };

  const validateLoginInput = () => {
    const { isEmail } = getLoginChannel();
    if (!login.trim()) {
      toast.error("Please enter your email or phone number");
      return false;
    }
    if (isEmail) {
      if (!isValidEmail(login)) {
        toast.error("Please enter a valid email address");
        return false;
      }
    } else {
      if (!isValidPhone(login)) {
        toast.error("Please enter a valid phone number (10–15 digits)");
        return false;
      }
    }
    return true;
  };

  const startCountdown = (secs = 60) => {
    setCountdown(secs);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRequestOTP = async (event) => {
    event.preventDefault();
    if (!validateLoginInput()) return;

    const { type, identifier, isEmail } = getLoginChannel();
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, identifier }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("OTP sent successfully!");
        setOtpSent(true);
        setStep(2);
        startCountdown(60);
      } else {
        if (res.status === 404) {
          toast.error(
            `This ${
              isEmail ? "email" : "mobile number"
            } is not registered. Please sign up first.`
          );
        } else {
          toast.error(
            data.detail ||
              `Failed to send OTP to your ${isEmail ? "email" : "phone"}`
          );
        }
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
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

    const { type, identifier } = getLoginChannel();
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/verify-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          identifier,
          otp_code: otp,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // data: { message, email, access_token }
        authLogin(data.email, data.access_token);
        toast.success("Login successful!", {
          onClose: () => navigate("/disclaimer"),
        });
      } else {
        toast.error(data.detail || "Invalid or expired OTP");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
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

      <div className="container" style={{ maxHeight: "390px" }}>
        <div className="form-container">
          <h1>Login to Medlife.ai</h1>

          <div style={{ marginTop: "25px" }}>
            {step === 1 ? (
              <form onSubmit={handleRequestOTP}>
                <label
                  htmlFor="login"
                  style={{ color: "gray", fontSize: "14px" }}
                >
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
                <p
                  style={{
                    marginBottom: "20px",
                    fontSize: "14px",
                    marginTop: "10px",
                  }}
                >
                  OTP sent to {login}. Please check your{" "}
                  {login.includes("@") ? "email" : "phone"}.
                </p>

                <label
                  htmlFor="otp"
                  style={{ color: "gray", fontSize: "14px" }}
                >
                  Enter OTP
                </label>
                <div
                  style={{ display: "flex", gap: "10px", marginBottom: "15px" }}
                >
                  {Array.from({ length: 6 }).map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      style={{
                        width: "40px",
                        height: "50px",
                        textAlign: "center",
                        fontSize: "20px",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                      }}
                      value={otp[index] || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                          // Only allow numbers
                          const newOtp = otp.split("");
                          newOtp[index] = value;
                          setOtp(newOtp.join(""));

                          // Auto focus to next input
                          if (value && index < 5) {
                            document
                              .getElementById(`otp-${index + 1}`)
                              ?.focus();
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !otp[index] && index > 0) {
                          document.getElementById(`otp-${index - 1}`)?.focus();
                        }
                      }}
                      id={`otp-${index}`}
                    />
                  ))}
                </div>
                {/* <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength="6"
                  inputMode="numeric"
                  pattern="\d{6}"
                /> */}

                {countdown > 0 && (
                  <p style={{ fontSize: "12px", color: "gray" }}>
                    OTP expires in {Math.floor(countdown / 60)}:
                    {(countdown % 60).toString().padStart(2, "0")}
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
                      marginTop: "4px",
                      fontSize: "14px",
                    }}
                    onClick={handleRequestOTP}
                  >
                    Resend OTP
                  </button>
                )}
              </form>
            )}
          </div>

          <p style={{ color: "gray", marginTop: "4px" }}>
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
