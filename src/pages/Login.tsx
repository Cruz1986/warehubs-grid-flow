
import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md p-4">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
