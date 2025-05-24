// src/pages/Signup.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cbSignup } from '@/utils/cbAuth';
import { useLanguage } from '@/context/language-context';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

export default function Signup() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error(t("app.auth.passwordMismatch")); return false;
    }
    if (formData.password.length < 6) {
      toast.error(t("app.auth.passwordTooShort")); return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await cbSignup(
        formData.name,
        formData.email,
        formData.password,
        formData.phone
      );
      toast.success(t("app.auth.signupSuccess"));
      navigate('/login');
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || t("app.auth.signupError"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const randomName = `Leader_${Math.floor(Math.random()*1000)}`;
      await cbSignup(
        randomName,
        `${randomName.toLowerCase()}@example.com`,
        "password123",
        "+1234567890"
      );
      toast.success(t("app.auth.signupSuccess"));
      navigate('/login');
    } catch (error: any) {
      console.error("Google signup error:", error);
      toast.error(error.message || t("app.auth.signupError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 to-secondary/5 p-4">
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
          <CardTitle className="text-2xl">{t("app.auth.createAccount")}</CardTitle>
          <CardDescription>{t("app.auth.enterDetails")}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {[
              { id: 'name', type: 'text', label: 'fullName', placeholder: 'fullNamePlaceholder' },
              { id: 'email', type: 'email', label: 'email', placeholder: 'emailPlaceholder' }
            ].map(f => (
              <div key={f.id} className="space-y-2">
                <Label htmlFor={f.id}>{t(`app.auth.${f.label}`)}</Label>
                <Input
                  id={f.id}
                  name={f.id}
                  type={f.type}
                  placeholder={t(`app.auth.${f.placeholder}`)}
                  value={(formData as any)[f.id]}
                  onChange={handleChange}
                  required
                  className="border-2"
                />
              </div>
            ))}

            <div className="space-y-2">
              <Label htmlFor="password">{t("app.auth.password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t("app.auth.passwordPlaceholder")}
                  value={formData.password}
                  onChange={handleChange}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("app.auth.confirmPassword")}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={t("app.auth.confirmPasswordPlaceholder")}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="border-2 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(p => !p)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? t("common.loading")
                : <span className="flex items-center gap-2"><UserPlus size={18}/> {t("app.auth.signup")}</span>
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
              onClick={handleGoogleSignup}
              disabled={loading}
            >
              {/* Google Icon... */}
              Google
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center">
              {t("app.auth.alreadyHaveAccount")}{' '}
              <Link to="/login" className="text-primary hover:underline">
                {t("app.auth.login")}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
