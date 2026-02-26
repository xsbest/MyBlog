import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-sand">
      <div className="container">
        <div className="login">
          <div className="login__card">
            <p className="hero__eyebrow">Daniel Xiong · 蛋妞的博客</p>
            <h1>登录</h1>
            <p className="login__subtitle">
              请输入账号密码进入个人博客。
            </p>
            <LoginClient />
          </div>
        </div>
      </div>
    </div>
  );
}
