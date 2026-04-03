'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { LucideShieldCheck } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Redirect or handle success
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-chrome flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex flex-col items-center gap-3 animate-fade-in">
        <h1 className="text-display text-ebony">Lumière</h1>
        <p className="text-subtitle text-bronze tracking-[0.2em] -mt-2">Estética Avançada</p>
      </div>

      <Card variant="premium" className="w-full max-w-md border-none !p-10">
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="flex flex-col gap-1 mb-2">
            <h2 className="text-page-title text-ebony">Bem-vinda de volta</h2>
            <p className="text-sm text-mid-gray">Acesse sua conta para gerenciar sua clínica</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <Input
            label="E-mail profissional"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="exemplo@clinica.com"
            required
          />

          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full py-4 mt-2" 
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Acessar Plataforma'}
          </Button>

          <button 
            type="button" 
            className="text-sm text-bronze hover:text-mahogany font-medium underline-offset-4 hover:underline transition-all text-center"
          >
            Esqueci minha senha
          </button>
        </form>
      </Card>

      <div className="mt-12 flex items-center gap-2 text-xs text-mid-gray">
        <LucideShieldCheck size={14} className="text-champagne" />
        <span>Ambiente seguro Nexus Lab AI</span>
      </div>
      
      {/* Decorative elements */}
      <div className="fixed bottom-0 left-0 w-64 h-64 bg-sand/20 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl -z-10" />
      <div className="fixed top-0 right-0 w-96 h-96 bg-champagne/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl -z-10" />
    </div>
  );
}
