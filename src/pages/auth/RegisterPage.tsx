import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { BookOpen, Loader } from 'lucide-react';
import { supabase } from "C:/Users/LENOVO/Downloads/project-bolt-sb1-fccpflcy/project/src/lib/supabase.ts";
 
interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const RegisterPage: React.FC = () => {
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
  
    try {
      console.log("Начинаем регистрацию с данными:", data);
  
      // Регистрация в Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });
  
      console.log("Ответ от supabase.auth.signUp:", signUpData, signUpError);
  
      if (signUpError) {
        console.error("Ошибка при регистрации:", signUpError);
        setError("Ошибка регистрации: " + signUpError.message);
        setIsLoading(false);
        return;
      }
  
      if (!signUpData?.user) {
        console.warn("Регистрация прошла, но пользователь не создан:", signUpData);
        setError('Не удалось создать пользователя');
        setIsLoading(false);
        return;
      }
  
      // Добавление профиля в таблицу profiles
      const { error: profileError } = await supabase.from('profiles').insert({
        id: signUpData.user.id,
        full_name: data.fullName,
        role: role,
        email: data.email,
      });
  
      if (profileError) {
        console.error("Ошибка вставки в таблицу profiles:", profileError);
        setError('Ошибка создания профиля: ' + profileError.message);
        setIsLoading(false);
        return;
      }
  
      alert('Регистрация прошла успешно! Проверьте email для подтверждения.');
  
    } catch (err: any) {
      console.error("Непредвиденная ошибка при регистрации:", err);
      setError('Произошла ошибка. Попробуйте еще раз.');
    }
  
    setIsLoading(false);
  };

  return (
    <div className="card p-8 animate-fade-in max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="flex justify-center">
          <BookOpen className="h-12 w-12 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">Create an Account</h1>
        <p className="text-gray-600">Join Armadex today</p>
      </div>

      {error && (
        <div className="bg-error-50 text-error-700 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="form-label">Full Name</label>
          <input
            id="fullName"
            type="text"
            className={`form-input ${errors.fullName ? 'border-error-500 focus:ring-error-500' : ''}`}
            placeholder="John Doe"
            {...register('fullName', { required: 'Full name is required' })}
          />
          {errors.fullName && <p className="form-error">{errors.fullName.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className="form-label">Email</label>
          <input
            id="email"
            type="email"
            className={`form-input ${errors.email ? 'border-error-500 focus:ring-error-500' : ''}`}
            placeholder="your@email.com"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
          />
          {errors.email && <p className="form-error">{errors.email.message}</p>}
        </div>

        <div>
          <label className="form-label">I am a</label>
          <div className="flex space-x-4 mt-1">
            <button
              type="button"
              className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                role === 'student'
                  ? 'bg-primary-50 border-primary-300 text-primary-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setRole('student')}
            >
              Student
            </button>
            <button
              type="button"
              className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                role === 'teacher'
                  ? 'bg-primary-50 border-primary-300 text-primary-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setRole('teacher')}
            >
              Teacher
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="password" className="form-label">Password</label>
          <input
            id="password"
            type="password"
            className={`form-input ${errors.password ? 'border-error-500 focus:ring-error-500' : ''}`}
            placeholder="••••••••"
            {...register('password', { 
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })}
          />
          {errors.password && <p className="form-error">{errors.password.message}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            className={`form-input ${errors.confirmPassword ? 'border-error-500 focus:ring-error-500' : ''}`}
            placeholder="••••••••"
            {...register('confirmPassword', { 
              required: 'Please confirm your password',
              validate: value => value === password || 'Passwords do not match'
            })}
          />
          {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          className="btn-primary w-full flex justify-center items-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600">Already have an account?</span>{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Sign in
        </Link>
      </div>
    </div>
  );
};
