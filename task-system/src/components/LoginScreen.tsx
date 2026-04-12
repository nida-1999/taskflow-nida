import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Card from "./ui/Card";
import { Heading, Text } from "./ui/Typography";

const LoginScreen = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const { name, email, password } = formData;

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    if (isRegister) {
      if (!name.trim()) {
        setError("Name is required for registration.");
        return;
      }
      
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }

      const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
      if (!specialCharRegex.test(password)) {
        setError("Password must include at least one special character.");
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isRegister) {
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
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
    setFormData({
      name : "",
      email : "",
      password : ""
    })
  };

  return (
    <div className="min-h-screen flex items-center justify-center !p-6 bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Card className="w-full max-w-[420px] !p-10 animate-fade-in shadow-xl">
        {/* Logo */}
        <div className="flex justify-center !mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: "var(--heading-color)", color: "var(--bg-secondary)" }}>
            ⚡
          </div>
        </div>

        <div className="text-center !mb-8">
          <Heading variant="h2" className="!mb-2">
            {isRegister ? "Create account" : "Sign in to TaskFlow"}
          </Heading>
          <Text variant="small">
            {isRegister ? "Start managing your projects today." : "Welcome back to your workspace."}
          </Text>
        </div>

        {error && (
          <div
            role="alert"
            className="!py-3 !px-[14px] rounded-lg bg-red-50 border border-red-100 text-red-500 text-[0.85rem] !mb-6 font-medium animate-in fade-in slide-in-from-top-1"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {isRegister && (
            <Input
              label="Name"
              type="text"
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          )}

          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-[0.8rem] font-semibold text-slate-500">Password</label>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                className="pr-16"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-slate-400 text-[0.7rem] font-bold cursor-pointer hover:text-slate-600 !px-2 !py-1 rounded"
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="!mt-2 w-full cursor-pointer"
            isLoading={isLoading}
          >
            {isRegister ? "Create Account" : "Sign In"}
          </Button>

          <p className="text-center text-[0.85rem] text-slate-500 !mt-2">
            {isRegister ? "Already have an account?" : "No account yet?"}{" "}
            <Button
              variant="link"
              type="button"
              onClick={toggleMode}
            >
              <p className="!mx-1 cursor-pointer">{isRegister ? "Sign In" : "Create Account"} </p>
            </Button>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default LoginScreen;
