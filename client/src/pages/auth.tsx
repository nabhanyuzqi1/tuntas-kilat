import { useState, useEffect } from 'react';
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

// Helper function for role-based redirection
const getRedirectPath = (role: string): string => {
  switch (role) {
    case 'admin_umum':
    case 'admin_perusahaan':
      return '/admin';
    case 'worker':
      return '/worker';
    case 'customer':
    default:
      return '/';
  }
};

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Check if already authenticated
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        const redirectPath = getRedirectPath(user.role);
        setLocation(redirectPath);
      } catch (error) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    }
  }, [setLocation]);
  
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
      const response = await apiRequest('POST', '/api/auth/whatsapp/send-otp', { phoneNumber: formatPhoneNumber(phoneNumber) });
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
        setError(result.message || 'Gagal mengirim OTP');
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
      const response = await apiRequest('POST', '/api/auth/whatsapp/verify-otp', {
        phoneNumber: formatPhoneNumber(phoneNumber),
        otp: otp.trim(),
        userData: {
          firstName: registerData.firstName || 'Customer',
          lastName: registerData.lastName || ''
        }
      });
      const result = await response.json() as AuthResponse;

      if (result.success && result.token) {
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        toast({
          title: 'Login Berhasil',
          description: 'Selamat datang di Tuntas Kilat!',
        });

        // Redirect based on user role
        const userRole = result.user?.role || 'customer';
        const redirectPath = getRedirectPath(userRole);
        setLocation(redirectPath);
      } else {
        setError(result.message || 'Verifikasi OTP gagal');
      }
    } catch (error) {
      setError('Gagal memverifikasi OTP. Silakan coba lagi.');
    } finally {
      setVerifyLoading(false);
    }
  };

  // Email Login
  const handleEmailLogin = async () => {
    if (!loginData.identifier.trim() || !loginData.password.trim()) {
      setError('Email dan password diperlukan');
      return;
    }

    setLoginLoading(true);
    setError('');

    try {
      const response = await apiRequest('POST', '/api/auth/login', {
        email: loginData.identifier.trim(),
        password: loginData.password
      });
      const result = await response.json() as AuthResponse;

      if (result.success && result.token) {
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        toast({
          title: 'Login Berhasil',
          description: 'Selamat datang kembali!',
        });

        // Redirect based on user role
        const userRole = result.user?.role || 'customer';
        const redirectPath = getRedirectPath(userRole);
        setLocation(redirectPath);
      } else {
        setError(result.message || 'Login gagal');
      }
    } catch (error) {
      setError('Gagal login. Silakan periksa email dan password.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Registration
  const handleRegistration = async () => {
    if (!registerData.firstName.trim() || !registerData.email.trim() || !registerData.password.trim()) {
      setError('Nama, email, dan password diperlukan');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('Password konfirmasi tidak cocok');
      return;
    }

    if (registerData.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setRegisterLoading(true);
    setError('');

    try {
      const response = await apiRequest('POST', '/api/auth/register', {
        firstName: registerData.firstName.trim(),
        lastName: registerData.lastName.trim(),
        email: registerData.email.trim(),
        phone: registerData.phone.trim(),
        password: registerData.password
      });
      const result = await response.json() as AuthResponse;

      if (result.success && result.token) {
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        toast({
          title: 'Registrasi Berhasil',
          description: 'Akun Anda telah dibuat!',
        });

        // Redirect based on user role  
        const userRole = result.user?.role || 'customer';
        const redirectPath = getRedirectPath(userRole);
        setLocation(redirectPath);
      } else {
        setError(result.message || 'Registrasi gagal');
      }
    } catch (error) {
      setError('Gagal membuat akun. Silakan coba lagi.');
    } finally {
      setRegisterLoading(false);
    }
  };

  // Format timer
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Tuntas Kilat</h1>
          <p className="text-lg text-gray-600">Platform Layanan On-Demand Terpercaya</p>
        </div>

        <Tabs defaultValue="whatsapp" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              WhatsApp OTP
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Login
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Daftar Akun
            </TabsTrigger>
          </TabsList>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <TabsContent value="whatsapp">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Masuk dengan WhatsApp
                </CardTitle>
                <CardDescription>
                  Verifikasi nomor WhatsApp Anda untuk masuk dengan mudah dan aman
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor WhatsApp</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isOtpSent}
                  />
                </div>

                {!isOtpSent ? (
                  <Button 
                    onClick={sendOTP} 
                    className="w-full"
                    disabled={otpLoading}
                  >
                    {otpLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mengirim OTP...
                      </>
                    ) : (
                      'Kirim Kode OTP'
                    )}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otp">Kode OTP (6 digit)</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                      />
                    </div>

                    <div className="text-center text-sm text-gray-600">
                      {otpTimer > 0 ? (
                        <span>Kode berlaku: {formatTimer(otpTimer)}</span>
                      ) : (
                        <Button variant="link" onClick={() => {
                          setIsOtpSent(false);
                          setOtp('');
                        }}>
                          Kirim ulang kode
                        </Button>
                      )}
                    </div>

                    <Button 
                      onClick={verifyOTP} 
                      className="w-full"
                      disabled={verifyLoading}
                    >
                      {verifyLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Memverifikasi...
                        </>
                      ) : (
                        'Verifikasi & Masuk'
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Masuk dengan Email
                </CardTitle>
                <CardDescription>
                  Masuk menggunakan email dan password yang telah terdaftar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@example.com"
                    value={loginData.identifier}
                    onChange={(e) => setLoginData(prev => ({...prev, identifier: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({...prev, password: e.target.value}))}
                  />
                </div>
                <Button 
                  onClick={handleEmailLogin} 
                  className="w-full"
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Masuk...
                    </>
                  ) : (
                    'Masuk'
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Buat Akun Baru
                </CardTitle>
                <CardDescription>
                  Daftar untuk mendapatkan akses penuh ke semua layanan kami
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nama Depan</Label>
                    <Input
                      id="firstName"
                      value={registerData.firstName}
                      onChange={(e) => setRegisterData(prev => ({...prev, firstName: e.target.value}))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nama Belakang</Label>
                    <Input
                      id="lastName"
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData(prev => ({...prev, lastName: e.target.value}))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registerEmail">Email</Label>
                  <Input
                    id="registerEmail"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({...prev, email: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registerPhone">Nomor HP (opsional)</Label>
                  <Input
                    id="registerPhone"
                    type="tel"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData(prev => ({...prev, phone: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registerPassword">Password</Label>
                  <Input
                    id="registerPassword"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData(prev => ({...prev, password: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData(prev => ({...prev, confirmPassword: e.target.value}))}
                  />
                </div>
                <Button 
                  onClick={handleRegistration} 
                  className="w-full"
                  disabled={registerLoading}
                >
                  {registerLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Membuat Akun...
                    </>
                  ) : (
                    'Buat Akun'
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Dengan masuk, Anda menyetujui{' '}
            <a href="#" className="text-blue-600 hover:underline">Syarat & Ketentuan</a>
            {' '}dan{' '}
            <a href="#" className="text-blue-600 hover:underline">Kebijakan Privasi</a>
          </p>
        </div>
      </div>
    </div>
  );
}