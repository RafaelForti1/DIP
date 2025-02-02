import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { supabase } from '../lib/supabase';
import type { SignUpData } from '../types/auth';

export function SignUp() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SignUpData>({
    email: '',
    password: '',
    rg: '',
    rank: '',
    qra: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('No user data returned');

      const { error: profileError } = await supabase
        .from('police_officers')
        .insert([
          {
            id: authData.user.id,
            rg: formData.rg,
            rank: formData.rank,
            qra: formData.qra,
          },
        ]);

      if (profileError) throw profileError;

      navigate('/signin');
      alert('Account created successfully! Please sign in.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account">
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>
          <div>
            <label htmlFor="rg" className="sr-only">
              RG
            </label>
            <input
              id="rg"
              name="rg"
              type="text"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="RG"
              value={formData.rg}
              onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="rank" className="sr-only">
              Rank/Patent
            </label>
            <input
              id="rank"
              name="rank"
              type="text"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Rank/Patent"
              value={formData.rank}
              onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="qra" className="sr-only">
              QRA
            </label>
            <input
              id="qra"
              name="qra"
              type="text"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="QRA"
              value={formData.qra}
              onChange={(e) => setFormData({ ...formData, qra: e.target.value })}
            />
          </div>
        </div>

        <div className="text-sm text-center">
          <Link
            to="/signin"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Already have an account?
          </Link>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <UserPlus className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
            </span>
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}