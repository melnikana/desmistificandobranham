"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setMsg("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/dashboard");
    } catch (err: any) {
      setMsg(err?.message || "Erro ao logar");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup() {
    setLoading(true);
    setMsg("");
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setMsg("Conta criada! Verifique seu e-mail se necessário.");
    } catch (err: any) {
      setMsg(err?.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Brand */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg font-bold">
            B
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-gray-900 dark:text-gray-100">Área administrativa</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Faça login com seu usuário e senha para publicar no site</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg px-8 py-10">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Seu email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 p-3"
                placeholder="seu@exemplo.com"
                autoComplete="email"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Senha</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 p-3"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </label>

            {msg && <p className="text-sm text-red-600 dark:text-red-400">{msg}</p>}

            <div className="flex items-center justify-between gap-4 mt-4">
              <button
                onClick={handleLogin}
                disabled={loading}
                className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>

              <button
                onClick={handleSignup}
                disabled={loading}
                className="flex-1 inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                {loading ? "Enviando..." : "Criar conta"}
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setEmail("");
                  setPassword("");
                  setMsg("");
                }}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Limpar campos
              </button>
            </div>
          </div>
        </div>

        {/* Footer small */}
        <p className="text-center text-xs text-gray-400">
          Desenvolvido por - melnikana
        </p>
      </div>
    </div>
  );
}
