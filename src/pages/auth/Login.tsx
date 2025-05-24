// src/pages/Login.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cbLogin } from '@/utils/cbAuth';
import { useLanguage } from '@/context/language-context';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from '@/components/ui/sonner';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export default function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t("app.auth.allFieldsRequired"));
      return;
    }
    setLoading(true);
    try {
      const user = await cbLogin(email, password);
      localStorage.setItem("user", JSON.stringify(user));
      toast.success(t("app.auth.loginSuccess"));
      navigate('/');
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || t("app.auth.loginError"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const user = await cbLogin("admin@saibalaji.com", "password123");
      localStorage.setItem("user", JSON.stringify(user));
      toast.success(t("app.auth.loginSuccess"));
      navigate('/');
    } catch (error: any) {
      console.error("Google login error:", error);
      toast.error(error.message || t("app.auth.loginError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br p-4 from-primary/10 to-secondary/5">
      <Card className="w-full max-w-md border-2 border-primary/10 shadow-lg">
        <CardHeader className="space-y-2 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary bg-white">
            <img
              src="/lovable-uploads/a723c9c5-8174-41c6-b9d7-2d8646801ec6.png"
              alt="Logo"
              className="w-full h-full object-cover"
              onError={e => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/lovable-uploads/dec9f020-a443-46b8-9996-45dedd958103.png";
              }}
            />
          </div>
          <span className="font-bold text-lg text-primary">Sai Balaji Construction</span>
          <CardTitle className="text-2xl">{t("app.auth.login")}</CardTitle>
          <CardDescription>{t("app.auth.enterCredentials")}</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("app.auth.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("app.auth.emailPlaceholder")}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="border-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("app.auth.password")}</Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  {t("app.auth.forgotPassword")}
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t("app.auth.passwordPlaceholder")}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="border-2 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? t("common.loading")
                : <span className="flex items-center gap-2"><LogIn size={18}/> {t("app.auth.login")}</span>
              }
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase bg-white px-2">
                {t("app.auth.orContinueWith")}
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-2"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {/* Google Icon... */}
              Google
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center">
              {t("app.auth.noAccount")}{' '}
              <Link to="/signup" className="text-primary hover:underline">
                {t("app.auth.signup")}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
