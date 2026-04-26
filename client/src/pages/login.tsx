import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { LoginContent } from "@/components/loginContent";
import { SignUpContent } from "@/components/signUpContent";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LoginPage = () => {
  const [authPage, setAuthPage] = useState("login");

  const LoginComponent = authPage === "login" ? LoginContent : SignUpContent;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <h1>Chat Flow</h1>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <Tabs
            className="flex flex-row justify-center items-center"
            value={authPage}
            onValueChange={(value) => setAuthPage(value)}
          >
            <TabsList>
              <TabsTrigger value="login" className="cursor-pointer">
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="cursor-pointer">
                Sign Up
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <LoginComponent />
      </Card>
    </div>
  );
};

export default LoginPage;
