import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Palette, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Base URL Configuration
const BASE_URL = 'https://az.lytortech.com';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const email = 'azacreation@gmail.com'; // Fixed email

  console.log('🚀 Index Component Initialized');
  console.log('📧 Email:', email);
  console.log('🌐 Base URL:', BASE_URL);

  // Check if user is already logged in
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      console.log('✅ User already authenticated, redirecting to admin...');
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  // Send OTP
  const handleSendOTP = async () => {
    console.log('=== SEND OTP PROCESS STARTED ===');
    console.log('📧 Sending OTP to:', email);
    console.log('🔗 API Endpoint:', `${BASE_URL}/api/admin/designs/otp_send`);
    
    setLoading(true);
    console.log('⏳ Loading state set to true');

    try {
      const requestBody = { email };
      console.log('📤 Request Body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${BASE_URL}/api/admin/designs/otp_send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 Response Status:', response.status);
      console.log('📡 Response OK:', response.ok);
      console.log('📡 Response Headers:', [...response.headers.entries()]);

      const data = await response.json();
      console.log('📥 Response Data:', JSON.stringify(data, null, 2));

      // Check if response is OK (status 200-299) OR if message contains "otp sent"
      if (response.ok || data.message?.toLowerCase().includes('otp sent')) {
        console.log('✅ OTP Sent Successfully');
        console.log('📧 OTP should be delivered to:', email);
        
        toast({
          title: 'OTP Sent Successfully',
          description: 'Please check your email for the verification code.',
        });
        
        setStep('otp');
        console.log('🔄 Step changed to: otp');
      } else {
        console.error('❌ Failed to send OTP');
        console.error('❌ Error Message:', data.message);
        
        toast({
          title: 'Error',
          description: data.message || 'Failed to send OTP',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('💥 EXCEPTION in handleSendOTP');
      console.error('💥 Error Type:', error.name);
      console.error('💥 Error Message:', error.message);
      console.error('💥 Error Stack:', error.stack);
      
      toast({
        title: 'Error',
        description: 'Failed to send OTP. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      console.log('⏳ Loading state set to false');
      console.log('=== SEND OTP PROCESS ENDED ===\n');
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    console.log('=== VERIFY OTP PROCESS STARTED ===');
    console.log('🔐 Entered OTP:', otp);
    console.log('🔐 OTP Length:', otp.length);
    
    if (!otp || otp.length < 6) {
      console.warn('⚠️ Invalid OTP - Length less than 6');
      toast({
        title: 'Invalid OTP',
        description: 'Please enter a valid 6-digit OTP',
        variant: 'destructive',
      });
      return;
    }

    console.log('📧 Email:', email);
    console.log('🔗 API Endpoint:', `${BASE_URL}/api/admin/designs/otp_verify`);

    setLoading(true);
    console.log('⏳ Loading state set to true');

    try {
      // Send as URL-encoded form data instead of JSON
      const formData = new URLSearchParams();
      formData.append('email', email);
      formData.append('otp', otp);
      
      console.log('📤 Request Body (Form Data):', formData.toString());

      const response = await fetch(`${BASE_URL}/api/admin/designs/otp_verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      console.log('📡 Response Status:', response.status);
      console.log('📡 Response OK:', response.ok);
      console.log('📡 Response Headers:', [...response.headers.entries()]);

      const data = await response.json();
      console.log('📥 Response Data:', JSON.stringify(data, null, 2));

      // Check if response is OK (status 200-299) OR if message contains "verified"
      if (response.ok || data.message?.toLowerCase().includes('verified')) {
        console.log('✅ OTP Verified Successfully');
        console.log('🎉 Login Successful');
        
        toast({
          title: 'Login Successful',
          description: 'Welcome to Aza Arts Admin Panel',
        });
        
        // Store authentication token
        const token = data.token || 'authenticated'; // Use actual token or fallback
        localStorage.setItem('authToken', token);
        console.log('💾 Token saved to localStorage');
        
        console.log('🔄 Navigating to /admin');
        navigate('/admin', { replace: true });
      } else {
        console.error('❌ OTP Verification Failed');
        console.error('❌ Error Message:', data.message);
        
        toast({
          title: 'Verification Failed',
          description: data.message || 'Invalid OTP. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('💥 EXCEPTION in handleVerifyOTP');
      console.error('💥 Error Type:', error.name);
      console.error('💥 Error Message:', error.message);
      console.error('💥 Error Stack:', error.stack);
      
      toast({
        title: 'Error',
        description: 'Failed to verify OTP. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      console.log('⏳ Loading state set to false');
      console.log('=== VERIFY OTP PROCESS ENDED ===\n');
    }
  };

  const handleBackToEmail = () => {
    console.log('🔙 Back button clicked');
    console.log('🔄 Changing step from otp to email');
    console.log('🗑️ Clearing OTP value');
    setStep('email');
    setOtp('');
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    console.log('⌨️ OTP Input Changed');
    console.log('⌨️ Raw Value:', e.target.value);
    console.log('⌨️ Cleaned Value:', value);
    setOtp(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-purple-600 to-pink-500 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-110 transition-transform duration-300">
              <Palette className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Aza Arts Admin
            </h1>
            <p className="text-gray-600">
              {step === 'email' ? 'Sign in to-continue' : 'Enter verification code'}
            </p>
          </div>

          {/* Email Step */}
          {step === 'email' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    value={email}
                    disabled
                    className="w-full pl-10 pr-4 py-6 text-base bg-gray-50 border-gray-300 rounded-xl cursor-not-allowed"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500">This email is pre-configured for admin access</p>
              </div>

              <Button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full py-6 text-base font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Sending OTP...
                  </div>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 mr-2" />
                    Send Verification Code
                  </>
                )}
              </Button>

              {/* Features */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 text-center">
                  Admin Features
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Palette className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-xs text-gray-600">Designs</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <ShieldCheck className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="text-xs text-gray-600">Analytics</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Lock className="w-4 h-4 text-pink-600" />
                    </div>
                    <p className="text-xs text-gray-600">Secure</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Verification Code
                </label>
                <Input
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="w-full px-4 py-6 text-center text-2xl font-bold tracking-widest rounded-xl border-2 focus:border-primary"
                  autoFocus
                />
                <p className="text-xs text-gray-500 text-center">
                  Check your email: {email}
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-6 text-base font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Verify & Login
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={handleBackToEmail}
                className="w-full text-sm text-gray-600 hover:text-primary transition-colors"
              >
                ← Back to email
              </button>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50"
                >
                  Resend Code
                </button>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Powered by{' '}
              <a
                href="https://lytortech.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:text-primary/80 transition-colors"
              >
                Lytortech
              </a>
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs">
            <Lock className="w-3 h-3 mr-2" />
            Secured with OTP Authentication
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
