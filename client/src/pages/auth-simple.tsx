import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Lock, User, Loader2, MessageSquare, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, login, register, sendWhatsAppOTP, verifyWhatsAppOTP, getRedirectPath, isLoading } = useSimpleAuth();
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  // WhatsApp login state
  const [whatsappData, setWhatsappData] = useState({
    phone: '',
    otp: '',
    otpSent: false,
    isRegistering: false, // To differentiate between login and register flow for WhatsApp
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'customer'
  });
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = getRedirectPath(user.role);
      setLocation(redirectPath);
    }
  }, [isAuthenticated, user, getRedirectPath, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(loginData.email, loginData.password);
      
      if (result.success && result.user) {
        toast({
          title: 'Login Berhasil',
          description: `Selamat datang, ${result.user.firstName}!`,
        });

        const redirectPath = getRedirectPath(result.user.role);
        setLocation(redirectPath);
      } else {
        setError(result.message || 'Login gagal');
      }
    } catch (error) {
      setError('Terjadi kesalahan saat login');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (registerData.password !== registerData.confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register({
        email: registerData.email,
        password: registerData.password,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        phone: registerData.phone,
        role: registerData.role
      });
      
      if (result.success && result.user) {
        toast({
          title: 'Registrasi Berhasil',
          description: `Selamat datang, ${result.user.firstName}!`,
        });

        const redirectPath = getRedirectPath(result.user.role);
        setLocation(redirectPath);
      } else {
        setError(result.message || 'Registrasi gagal');
      }
    } catch (error) {
      setError('Terjadi kesalahan saat registrasi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!whatsappData.otpSent) {
        // Step 1: Send OTP
        const result = await sendWhatsAppOTP(whatsappData.phone);
        if (result.success) {
          setWhatsappData(prev => ({ ...prev, otpSent: true }));
          toast({
            title: 'OTP Terkirim',
            description: 'Kode OTP telah dikirim ke nomor WhatsApp Anda.',
          });
        } else {
          setError(result.message || 'Gagal mengirim OTP');
        }
      } else {
        // Step 2: Verify OTP
        const result = await verifyWhatsAppOTP(whatsappData.phone, whatsappData.otp);
        if (result.success && result.user) {
          toast({
            title: 'Login Berhasil',
            description: `Selamat datang, ${result.user.firstName}!`,
          });
          const redirectPath = getRedirectPath(result.user.role);
          setLocation(redirectPath);
        } else {
          setError(result.message || 'Verifikasi OTP gagal');
        }
      }
    } catch (error) {
      setError('Terjadi kesalahan saat proses WhatsApp login');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tuntas Kilat</h1>
          <p className="text-gray-600">Layanan cepat, tuntas, dan terpercaya</p>
        </div>

        <Card className="shadow-lg">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Email</TabsTrigger>
              <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
              <TabsTrigger value="register">Daftar</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Masuk ke Akun
                  </CardTitle>
                  <CardDescription>
                    Masukkan email dan password Anda untuk melanjutkan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="nama@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Masukkan password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>

                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                    <strong>Akun Test:</strong><br />
                    Email: nabhanyuzqi1@gmail.com<br />
                    Password: @Yuzqi07070<br />
                    <small className="text-gray-500">
                      Gunakan akun ini untuk testing (Admin)
                    </small>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Masuk...
                      </>
                    ) : (
                      'Masuk'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            {/* WhatsApp Login Tab */}
            <TabsContent value="whatsapp">
              <form onSubmit={handleWhatsAppLogin}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Masuk via WhatsApp
                  </CardTitle>
                  <CardDescription>
                    Masukkan nomor WhatsApp Anda untuk menerima kode OTP
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-phone">Nomor WhatsApp</Label>
                    <Input
                      id="whatsapp-phone"
                      type="tel"
                      placeholder="+628123456789"
                      value={whatsappData.phone}
                      onChange={(e) => setWhatsappData({ ...whatsappData, phone: e.target.value })}
                      required
                    />
                  </div>

                  {whatsappData.otpSent && (
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp-otp">Kode OTP</Label>
                      <Input
                        id="whatsapp-otp"
                        type="text"
                        placeholder="Masukkan 6 digit kode OTP"
                        value={whatsappData.otp}
                        onChange={(e) => setWhatsappData({ ...whatsappData, otp: e.target.value })}
                        required
                      />
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {!whatsappData.otpSent ? (
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Mengirim OTP...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Kirim OTP via WhatsApp
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Memverifikasi...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Verifikasi & Masuk
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </form>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <form onSubmit={handleRegister}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Buat Akun Baru
                  </CardTitle>
                  <CardDescription>
                    Daftar untuk mengakses semua layanan Tuntas Kilat
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nama Depan</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={registerData.firstName}
                        onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nama Belakang</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={registerData.lastName}
                        onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="nama@email.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Telepon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+628123456789"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Minimal 6 karakter"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Ulangi password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Mendaftar...
                      </>
                    ) : (
                      'Daftar'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>Dengan mendaftar, Anda setuju dengan</p>
          <a href="/terms-of-service" className="text-blue-600 hover:underline">
            Syarat dan Ketentuan
          </a>
          {' dan '}
          <a href="/privacy-policy" className="text-blue-600 hover:underline">
            Kebijakan Privasi
          </a>
        </div>
      </div>
    </div>
  );
}