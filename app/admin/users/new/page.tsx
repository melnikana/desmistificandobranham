"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, ArrowLeft } from "lucide-react";
import { sendUserCredentialsEmail } from "@/lib/emailService";

function generateRandomPassword(length = 12): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";
  const all = uppercase + lowercase + numbers + symbols;

  let password = "";
  // Garantir pelo menos um de cada tipo
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Preencher o resto aleatoriamente
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Embaralhar a senha
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

export default function NewUserPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then((res) => {
      const user = res?.data?.user;
      if (!mounted) return;
      if (!user) {
        const dev = typeof window !== "undefined" ? localStorage.getItem("dev_auth_user") : null;
        if (!dev) {
          router.push("/login");
        } else {
          setChecking(false);
        }
      } else {
        setChecking(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [router]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Nome completo é obrigatório";
    }

    if (!email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!validateEmail(email)) {
      newErrors.email = "Email inválido";
    }

    if (!password.trim()) {
      newErrors.password = "Senha é obrigatória";
    } else if (password.length < 8) {
      newErrors.password = "Senha deve ter no mínimo 8 caracteres";
    }

    if (!role) {
      newErrors.role = "Função do usuário é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword(12);
    setPassword(newPassword);
    // Limpar erro de senha se existir
    if (errors.password) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.password;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setEmailSent(false);
    setEmailError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const userData = {
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password, // Senha temporária
        role: role,
        created_at: new Date().toISOString(),
      };

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/admin/users/new/page.tsx:148',message:'Checking Supabase config',data:{hasUrl:!!process.env.NEXT_PUBLIC_SUPABASE_URL,hasKey:!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      // Tentar salvar no Supabase primeiro
      // No cliente, process.env só funciona para variáveis NEXT_PUBLIC_*
      // Verificar se o Supabase está realmente configurado
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      // Verificar se as variáveis existem E não são valores dummy/placeholder
      const hasSupabase = supabaseUrl && 
        supabaseUrl !== '' && 
        supabaseUrl !== 'undefined' &&
        !supabaseUrl.includes('placeholder') &&
        !supabaseUrl.includes('dummy') &&
        supabaseKey && 
        supabaseKey !== '' && 
        supabaseKey !== 'undefined' &&
        !supabaseKey.includes('placeholder') &&
        !supabaseKey.includes('dummy');

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/admin/users/new/page.tsx:152',message:'Checking Supabase config',data:{hasUrl:!!supabaseUrl,hasKey:!!supabaseKey,hasSupabase},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion

      let userSaved = false;

      if (hasSupabase) {
        try {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/admin/users/new/page.tsx:163',message:'Attempting Supabase signUp',data:{email:userData.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          // Tentar criar usuário no Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
              data: {
                name: userData.name,
                role: userData.role,
              },
            },
          });

          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/admin/users/new/page.tsx:180',message:'Supabase signUp result',data:{hasError:!!authError,hasUser:!!authData?.user,errorMessage:authError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion

          if (authError) throw authError;

          // Se houver tabela de profiles, salvar também lá
          if (authData.user) {
            const { error: profileError } = await supabase
              .from("profiles")
              .upsert({
                id: authData.user.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                created_at: userData.created_at,
              });

            // Ignorar erro se a tabela não existir
            if (profileError && !profileError.message.includes("does not exist")) {
              console.warn("Erro ao salvar perfil:", profileError);
            }
          }

          userSaved = true;
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/admin/users/new/page.tsx:203',message:'User saved to Supabase successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
        } catch (supabaseError: any) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/admin/users/new/page.tsx:206',message:'Supabase save failed, falling back to localStorage',data:{error:supabaseError?.message,errorType:supabaseError?.constructor?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          // Se falhar no Supabase, tentar localStorage
          console.warn("Erro ao salvar no Supabase, usando localStorage:", supabaseError);
        }
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/admin/users/new/page.tsx:212',message:'Supabase not configured, skipping Supabase save',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
      }

      // Fallback para localStorage
      if (!userSaved) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/admin/users/new/page.tsx:224',message:'Saving to localStorage',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        try {
          const existing = JSON.parse(
            localStorage.getItem("dev_users") || "[]"
          );
          existing.unshift(userData);
          localStorage.setItem("dev_users", JSON.stringify(existing));
          userSaved = true;
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/admin/users/new/page.tsx:232',message:'User saved to localStorage successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
        } catch (localStorageError: any) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/admin/users/new/page.tsx:235',message:'localStorage save failed',data:{error:localStorageError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          throw new Error("Erro ao salvar usuário no localStorage: " + localStorageError.message);
        }
      }

      // Se usuário foi salvo com sucesso, enviar email
      if (userSaved) {
        setSuccess(true);
        
        // Enviar email com credenciais (não bloqueia se falhar)
        try {
          const emailResult = await sendUserCredentialsEmail(
            userData.name,
            userData.email,
            userData.password
          );

          if (emailResult.success) {
            setEmailSent(true);
          } else {
            setEmailError(emailResult.error || "Erro ao enviar email");
            console.error("Erro ao enviar email:", emailResult.error);
          }
        } catch (emailErr: any) {
          setEmailError(emailErr.message || "Erro ao enviar email");
          console.error("Erro ao enviar email:", emailErr);
        }

        setTimeout(() => {
          router.push("/admin/users");
        }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || "Erro ao criar usuário. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <AdminLayout>
        <div className="p-10">Verificando sessão...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb e Título */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <button
            onClick={() => router.push("/admin/users")}
            className="hover:text-gray-900 transition-colors"
          >
            Usuários
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">Adicionar novo</span>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Adicionar novo usuário</h1>
        </div>

        {/* Card do Formulário */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h2 className="text-2xl font-semibold leading-none tracking-tight text-gray-900">
              Informações do usuário
            </h2>
            <p className="text-sm text-gray-600">
              Preencha os dados abaixo para criar um novo usuário no sistema.
            </p>
          </div>
          <div className="p-6 pt-0">
            {success && (
              <div className="mb-6 p-4 rounded-md" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <p className="font-medium" style={{ color: '#166534' }}>
                  Usuário criado com sucesso!
                </p>
              </div>
            )}

            {emailSent && (
              <div className="mb-6 p-4 rounded-md" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <p className="font-medium" style={{ color: '#166534' }}>
                  Email com credenciais enviado com sucesso!
                </p>
              </div>
            )}

            {emailError && (
              <div className="mb-6 p-4 rounded-md" style={{ backgroundColor: '#fef3c7', border: '1px solid #fcd34d' }}>
                <p className="font-medium" style={{ color: '#92400e' }}>
                  Usuário criado, mas houve um problema ao enviar o email: {emailError}
                </p>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 rounded-md" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                <p className="font-medium" style={{ color: '#991b1b' }}>{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome completo */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-900">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Digite o nome completo"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.name;
                        return newErrors;
                      });
                    }
                  }}
                  className={`bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus-visible:ring-gray-400 ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.email;
                        return newErrors;
                      });
                    }
                  }}
                  className={`bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus-visible:ring-gray-400 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Senha temporária */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-900">Senha temporária</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite uma senha ou gere automaticamente"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.password;
                          return newErrors;
                        });
                      }
                    }}
                    className={`bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus-visible:ring-gray-400 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGeneratePassword}
                    className="whitespace-nowrap"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Gerar senha automática
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
                {password && (
                  <p className="text-xs text-gray-500">
                    Senha gerada: {password.length} caracteres
                  </p>
                )}
              </div>

              {/* Função do usuário */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-gray-900">Função do usuário</Label>
                <Select
                  value={role}
                  onValueChange={(value) => {
                    setRole(value);
                    if (errors.role) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.role;
                        return newErrors;
                      });
                    }
                  }}
                >
                  <SelectTrigger
                    id="role"
                    className={`bg-white border-gray-300 text-gray-900 focus:ring-gray-400 ${errors.role ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Selecione a função" className="text-gray-500" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 text-gray-900">
                    <SelectItem value="administrador" className="text-gray-900 focus:bg-gray-100">Administrador</SelectItem>
                    <SelectItem value="editor" className="text-gray-900 focus:bg-gray-100">Editor</SelectItem>
                    <SelectItem value="autor" className="text-gray-900 focus:bg-gray-100">Autor</SelectItem>
                    <SelectItem value="colaborador" className="text-gray-900 focus:bg-gray-100">Colaborador</SelectItem>
                    <SelectItem value="assinante" className="text-gray-900 focus:bg-gray-100">Assinante</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-red-600">{errors.role}</p>
                )}
              </div>

              {/* Botões */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/users")}
                  disabled={loading}
                  className="border-gray-300 hover:bg-gray-50"
                  style={{ color: 'var(--color-gray-100)' }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading || success}
                  className="bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar usuário"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

