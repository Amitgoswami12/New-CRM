import { Routes, Route, Navigate } from 'react-router-dom';

import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';

import ForgetPassword from '@/pages/ForgetPassword';
import ResetPassword from '@/pages/ResetPassword';

import { useDispatch } from 'react-redux';
import Signup from '@/pages/SignUp';

export default function AuthRouter() {
  const dispatch = useDispatch();

  return (
    <Routes>
      <Route element={<Login />} path="/" />
      <Route element={<Login />} path="/login" />
      <Route element={<Signup />} path="/signup" />
      <Route element={<Navigate to="/login" replace />} path="/logout" />
      <Route element={<ForgetPassword />} path="/forgetpassword" />
      <Route element={<ResetPassword />} path="/resetpassword/:userId/:resetToken" />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
