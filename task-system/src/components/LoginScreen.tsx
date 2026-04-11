import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Heading from "./input/Heading";
import Input from "./input/Input";
import Button from "./input/Button";
import Card from "./input/Card";

const LoginScreen = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !password.trim()) {
      setError("Name and password are required.");
      return;
    }

    if (isRegister && !email.trim()) {
      setError("Email is required for registration.");
      return;
    }

    setIsLoading(true);

    try {
      if (isRegister) {
        await register(name.trim(), email.trim(), password);
      } else {
        await login(name.trim(), password);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister((prev) => !prev);
    setError(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-primary)",
        padding: 24,
      }}
    >
      <Card 
        className="animate-fade-in" 
        style={{ 
          width: "100%", 
          maxWidth: 420, 
          padding: 40,
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)"
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#0f172a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.25rem",
              color: "white",
            }}
          >
            ⚡
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Heading level={1} style={{ color: "#0f172a" }}>
            {isRegister ? "Create account" : "Sign in to TaskFlow"}
          </Heading>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            {isRegister ? "Start managing your projects today." : "Welcome back to your workspace."}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              padding: "12px 14px",
              borderRadius: 8,
              background: "#fef2f2",
              border: "1px solid #fee2e2",
              color: "#ef4444",
              fontSize: "0.85rem",
              marginBottom: 24,
              fontWeight: 500
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Name</label>
            <Input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Email</label>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Password</label>
              {!isRegister && (
                <button type="button" style={{ background: "none", border: "none", color: "var(--accent)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                  Forgot?
                </button>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <Input
                type={showPassword ? "text" : "password"}
                style={{ width: "100%", paddingRight: 60 }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            style={{ marginTop: 8 }}
          >
            {isRegister ? "Create Account" : "Sign In"}
          </Button>

          <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: 8 }}>
            {isRegister ? "Already have an account?" : "No account yet?"}{" "}
            <button
              type="button"
              onClick={toggleMode}
              style={{
                background: "none",
                border: "none",
                color: "var(--accent)",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {isRegister ? "Sign In" : "Create Account"}
            </button>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default LoginScreen;
