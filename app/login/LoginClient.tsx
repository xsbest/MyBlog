"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      setStatus("账号或密码错误");
      setLoading(false);
      return;
    }
    const redirectTo = searchParams.get("from") || "/";
    router.replace(redirectTo);
    router.refresh();
  };

  return (
    <form className="login__form" onSubmit={handleSubmit}>
      <label>
        账号
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="daniel"
          autoComplete="username"
        />
      </label>
      <label>
        密码
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="xs52517"
          autoComplete="current-password"
        />
      </label>
      <button className="btn btn--primary" type="submit" disabled={loading}>
        {loading ? "登录中..." : "登录"}
      </button>
      {status && <p className="login__status">{status}</p>}
    </form>
  );
}
