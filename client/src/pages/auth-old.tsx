import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Smartphone, Mail, Lock, User, Check, Loader2, ArrowLeft } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: any;
}

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // WhatsApp OTP State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  
  // Email Login State
  const [loginData, setLoginData] = useState({
    identifier: '',
    password: ''
  });
  const [loginLoading, setLoginLoading] = useState(false);
  
  // Registration State
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  
  const [error, setError] = useState('');

  // Format phone number for Indonesian format
  const formatPhoneNumber = (phone: string): string => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    } else if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }
    return '+' + cleaned;
  };

  // Send OTP via WhatsApp
  const sendOTP = async () => {
    if (!phoneNumber.trim()) {
      setError('Nomor telepon diperlukan');
      return;
    }

    setOtpLoading(true);
    setError('');

    try {
      const response = await apiRequest('POST', '/api/auth/whatsapp/send-otp', {
        phoneNumber: formatPhoneNumber(phoneNumber)
      });
      const result = await response.json() as AuthResponse;

      if (result.success) {
        setIsOtpSent(true);
        setOtpTimer(300); // 5 minutes countdown
        toast({
          title: 'OTP Terkirim',
          description: 'Kode OTP telah dikirim via WhatsApp',
        });

        // Start countdown timer
        const interval = setInterval(() => {
          setOtpTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Gagal mengirim OTP. Silakan coba lagi.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP and login
  const verifyOTP = async () => {
    if (!otp.trim()) {
      setError('Kode OTP diperlukan');
      return;
    }

    setVerifyLoading(true);
    setError('');

    try {
      const response = await apiRequest('POST', '/api/auth/verify-otp', {
        phoneNumber: formatPhoneNumber(phoneNumber),
        otp: otp.trim(),
        userData: {
          firstName: registerData.firstName || 'Customer',
          lastName: registerData.lastName || ''
        }
      });
      const result = await response.json() as AuthResponse;

      if (result.success && result.token) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        toast({
          title: 'Login Berhasil',
          description: 'Selamat datang di Tuntas Kilat!',
        });

        // Redirect based on user role
        if (response.user?.role === 'worker') {
          setLocation('/worker/dashboard');
        } else if (response.user?.role === 'admin_umum' || response.user?.role === 'admin_perusahaan') {
          setLocation('/admin/dashboard');
        } else {
          setLocation('/');
        }
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Gagal memverifikasi OTP. Silakan coba lagi.');
    } finally {
      setVerifyLoading(false);
    }
  };

  // Email/Password Login
  const handleLogin = async () => {
    if (!loginData.identifier.trim() || !loginData.password.trim()) {
      setError('Email/telepon dan password diperlukan');
      return;
    }

    setLoginLoading(true);
    setError('');

    try {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: loginData
      }) as AuthResponse;

      if (response.success && response.token) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        toast({
          title: 'Login Berhasil',
          description: 'Selamat datang kembali!',
        });

        // Redirect based on user role
        if (response.user?.role === 'worker') {
          setLocation('/worker/dashboard');
        } else if (response.user?.role === 'admin_umum' || response.user?.role === 'admin_perusahaan') {
          setLocation('/admin/dashboard');
        } else {
          setLocation('/');
        }
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Gagal login. Silakan coba lagi.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Registration
  const handleRegister = async () => {
    if (!registerData.firstName.trim() || !registerData.email.trim() || 
        !registerData.phone.trim() || !registerData.password.trim()) {
      setError('Semua field diperlukan');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    if (registerData.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setRegisterLoading(true);
    setError('');

    try {
      const { confirmPassword, ...dataToSend } = registerData;
      dataToSend.phone = formatPhoneNumber(dataToSend.phone);

      const response = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: dataToSend
      }) as AuthResponse;

      if (response.success && response.token) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        toast({
          title: 'Registrasi Berhasil',
          description: 'Selamat datang di Tuntas Kilat!',
        });

        setLocation('/');
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Gagal registrasi. Silakan coba lagi.');
    } finally {
      setRegisterLoading(false);
    }
  };

  // Format timer display
  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 via-teal-600 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back Button */}
        <div className="flex justify-start">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 transition-colors"
            onClick={() => setLocation('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </div>
        
        {/* Logo and Header */}
        <div className="text-center text-white space-y-2">
          <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-3xl font-bold">Tuntas Kilat</h1>
          <p className="text-teal-100">Masuk ke akun Anda</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <Tabs defaultValue="whatsapp" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="whatsapp" className="text-xs">
                <MessageSquare className="w-4 h-4 mr-1" />
                WhatsApp
              </TabsTrigger>
              <TabsTrigger value="login" className="text-xs">
                <Mail className="w-4 h-4 mr-1" />
                Email
              </TabsTrigger>
              <TabsTrigger value="register" className="text-xs">
                <User className="w-4 h-4 mr-1" />
                Daftar
              </TabsTrigger>
            </TabsList>

            {/* WhatsApp OTP Login */}
            <TabsContent value="whatsapp">
              <CardHeader className="text-center pb-2">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Smartphone className="w-5 h-5 text-green-600" />
                  Login via WhatsApp
                </CardTitle>
                <CardDescription>
                  Verifikasi nomor telepon dengan OTP WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {!isOtpSent ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Nomor Telepon</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="08123456789"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="text-center text-lg"
                      />
                      <p className="text-xs text-gray-500 text-center">
                        Format: 08xxx atau +62xxx
                      </p>
                    </div>

                    <Button 
                      onClick={sendOTP} 
                      disabled={otpLoading || !phoneNumber.trim()}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {otpLoading ? (
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
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-3">
                        <Check className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-sm text-gray-600">
                        Kode OTP telah dikirim ke
                      </p>
                      <p className="font-medium text-green-600">
                        {formatPhoneNumber(phoneNumber)}
                      </p>
                      {otpTimer > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          Berlaku selama: {formatTimer(otpTimer)}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="otp">Kode OTP (6 digit)</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="text-center text-xl tracking-widest"
                        maxLength={6}
                      />
                    </div>

                    <Button 
                      onClick={verifyOTP} 
                      disabled={verifyLoading || otp.length !== 6}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {verifyLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Memverifikasi...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Verifikasi & Masuk
                        </>
                      )}
                    </Button>

                    <div className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsOtpSent(false);
                          setOtp('');
                          setOtpTimer(0);
                          setError('');
                        }}
                        disabled={otpTimer > 240} // Allow resend after 1 minute
                      >
                        Ubah nomor telepon
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </TabsContent>

            {/* Email/Password Login */}
            <TabsContent value="login">
              <CardHeader className="text-center pb-2">
                <CardTitle>Login dengan Email</CardTitle>
                <CardDescription>
                  Masuk dengan email dan password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="identifier">Email atau Telepon</Label>
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="email@example.com"
                    value={loginData.identifier}
                    onChange={(e) => setLoginData({...loginData, identifier: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  />
                </div>

                <Button 
                  onClick={handleLogin} 
                  disabled={loginLoading}
                  className="w-full"
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Masuk...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Masuk
                    </>
                  )}
                </Button>
              </CardContent>
            </TabsContent>

            {/* Registration */}
            <TabsContent value="register">
              <CardHeader className="text-center pb-2">
                <CardTitle>Daftar Akun Baru</CardTitle>
                <CardDescription>
                  Buat akun untuk menggunakan layanan Tuntas Kilat
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nama Depan</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={registerData.firstName}
                      onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nama Belakang</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData({...registerData, lastName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="08123456789"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Ketik ulang password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                  />
                </div>

                <Button 
                  onClick={handleRegister} 
                  disabled={registerLoading}
                  className="w-full"
                >
                  {registerLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mendaftar...
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4 mr-2" />
                      Daftar Akun
                    </>
                  )}
                </Button>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Footer */}
        <div className="text-center text-white text-sm">
          <p>Dengan masuk, Anda menyetujui</p>
          <p>
            <a href="#" className="underline">Syarat & Ketentuan</a> dan{' '}
            <a href="#" className="underline">Kebijakan Privasi</a>
          </p>
        </div>
      </div>
    </div>
  );
}