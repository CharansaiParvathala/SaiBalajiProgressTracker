import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { AuthLogo } from '@/components/auth/AuthLogo';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

export default function Signup() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
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
      toast.error(t("app.auth.passwordMismatch"));
      return false;
    }
    if (formData.password.length < 6) {
      toast.error(t("app.auth.passwordTooShort"));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.phone);
      toast.success(t("app.auth.signupSuccess"));
      navigate('/login');
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(t("app.auth.signupError"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const randomName = `Leader_${Math.floor(Math.random() * 1000)}`;
      await register(
        randomName,
        `${randomName.toLowerCase()}@example.com`,
        "password123",
        "+1234567890"
      );
      toast.success(t("app.auth.signupSuccess"));
      navigate('/login');
    } catch (error) {
      console.error("Google signup error:", error);
      toast.error(t("app.auth.signupError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-primary/10 to-secondary/5 dark:from-primary/5 dark:to-background">
      <Card className="w-full max-w-md border-2 border-primary/10 dark:border-primary/20 shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <AuthLogo className="h-12 w-auto" alt="Sai Balaji Construction" />
          </div>
          <CardTitle className="text-2xl text-center">{t("app.auth.createAccount")}</CardTitle>
          <CardDescription className="text-center">{t("app.auth.enterDetails")}</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {[
              { id: "name", type: "text", label: "fullName", placeholder: "fullNamePlaceholder" },
              { id: "email", type: "email", label: "email", placeholder: "emailPlaceholder" },
              { id: "phone", type: "tel", label: "phone", placeholder: "phonePlaceholder" },
            ].map(field => (
              <div className="space-y-2" key={field.id}>
                <Label htmlFor={field.id}>{t(`app.auth.${field.label}`)}</Label>
                <Input
                  id={field.id}
                  name={field.id}
                  type={field.type}
                  placeholder={t(`app.auth.${field.placeholder}`)}
                  value={formData[field.id as keyof typeof formData]}
                  onChange={handleChange}
                  required
                  className="bg-background dark:bg-background border-2"
                />
              </div>
            ))}

            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password">{t("app.auth.password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("app.auth.passwordPlaceholder")}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-background dark:bg-background border-2 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("app.auth.confirmPassword")}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t("app.auth.confirmPasswordPlaceholder")}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="bg-background dark:bg-background border-2 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("common.loading") : (
                <span className="flex items-center gap-2">
                  <UserPlus size={18} />
                  {t("app.auth.signup")}
                </span>
              )}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-600"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background dark:bg-card px-2 text-muted-foreground">
                  {t("app.auth.orContinueWith")}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-2"
              onClick={handleGoogleSignup}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
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
