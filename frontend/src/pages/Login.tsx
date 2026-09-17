import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('officer@oil.in');
  const [password, setPassword] = useState('password123');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-surface-1 border border-border rounded-xl shadow-md p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-1">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground font-mono">PrecursorAI</h1>
          <p className="text-xs text-foreground-muted">Operational Safety Command Center</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-foreground mb-1">CORPORATE EMAIL</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-foreground-dim" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-background text-xs outline-none focus:border-primary text-foreground font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-foreground mb-1">PASSWORD</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-foreground-dim" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-background text-xs outline-none focus:border-primary text-foreground font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-md text-xs font-mono transition-colors flex items-center justify-center gap-2"
          >
            Authenticate Session <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-[11px] text-foreground-dim font-mono text-center pt-2 border-t border-border">
          Role-Based Access Control · Multi-Tenant Isolation
        </div>
      </div>
    </div>
  );
}
