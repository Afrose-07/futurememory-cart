import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./AuthPages.css";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    // In a real app, send token and new password to backend here.
    setMsg("Password reset successfully!");
    setError("");
    setTimeout(() => navigate("/login"), 2000);
  };

  return (
    <div className="fm-auth-page-wrapper">
      <div className="fm-auth-clean-card">
        <div className="fm-auth-brand-section">
          <h1 className="fm-auth-main-title">Reset Password</h1>
          <p className="fm-auth-main-subtitle">Enter your new password below.</p>
        </div>
        {error && <div className="fm-auth-alert-box">{error}</div>}
        {msg && <div className="fm-auth-alert-box fm-success-box" style={{backgroundColor:"#dcfce7",color:"#15803d"}}>{msg}</div>}
        <form onSubmit={handleSubmit} className="fm-auth-clean-form">
          <div className="fm-clean-group">
            <label className="fm-clean-label">New Password</label>
            <div className="fm-clean-input-wrap">
              <input type="password" required className="fm-clean-input" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>
          <div className="fm-clean-group">
            <label className="fm-clean-label">Confirm Password</label>
            <div className="fm-clean-input-wrap">
              <input type="password" required className="fm-clean-input" value={confirm} onChange={e => setConfirm(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="fm-btn-primary" style={{ width: '100%', marginTop: '16px' }}>Reset Password</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
