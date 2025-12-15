"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
            // Tentar inserir perfil mas, se a tipagem do Supabase não reconhecer, ignorar tipos
            const { error: profileError } = await supabase
              .from("profiles")
              // @ts-ignore - profiles table types may not be generated, ignore for dev
              .upsert([
                {
                  id: authData.user.id,
                  name: userData.name,
                  email: userData.email,
                  role: userData.role,
                  created_at: userData.created_at,
                }
              ]);

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
      <AdminShell title="Adicionar Usuário">
        <div className="p-10">Verificando sessão...</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Adicionar Usuário">
      <div className="max-w-2xl mx-auto space-y-6">
        {success && (
          <div className="rounded-lg border bg-green-50 p-4 text-green-900 shadow-sm">
            <p className="text-sm font-medium">
              Usuário criado com sucesso!
            </p>
          </div>
        )}

        {emailSent && (
          <div className="rounded-lg border bg-green-50 p-4 text-green-900 shadow-sm">
            <p className="text-sm font-medium">
              Email com credenciais enviado com sucesso!
            </p>
          </div>
        )}

        {emailError && (
          <div className="rounded-lg border bg-yellow-50 p-4 text-yellow-900 shadow-sm">
            <p className="text-sm font-medium">
              Usuário criado, mas houve um problema ao enviar o email: {emailError}
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive shadow-sm">
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Card do Formulário */}
        <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Informações do usuário</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para criar um novo usuário no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome completo */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
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
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Senha temporária */}
            <div className="space-y-2">
              <Label htmlFor="password">Senha temporária</Label>
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
                  className={errors.password ? "border-destructive" : ""}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGeneratePassword}
                  className="whitespace-nowrap"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Gerar senha
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
              {password && (
                <p className="text-xs text-muted-foreground">
                  Senha gerada: {password.length} caracteres
                </p>
              )}
            </div>

            {/* Função do usuário */}
            <div className="space-y-2">
              <Label htmlFor="role">Função do usuário</Label>
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
                  className={errors.role ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrador">Administrador</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="autor">Autor</SelectItem>
                  <SelectItem value="colaborador">Colaborador</SelectItem>
                  <SelectItem value="assinante">Assinante</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role}</p>
              )}
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/users")}
                disabled={loading}
                className="shadow-sm text-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || success}
                className="shadow-sm"
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
        </CardContent>
      </Card>
      </div>
    </AdminShell>
  );
}

