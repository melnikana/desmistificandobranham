"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CreateAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function createAdmin() {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      alert("Erro: " + error.message);
      return;
    }

    alert("Admin criado com sucesso!");
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Criar admin</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        placeholder="Senha"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={createAdmin}>Criar admin</button>
    </div>
  );
}
