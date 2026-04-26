import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useUserContext } from "@/contexts/hooks/user";
import useFetch from "@/hooks/useFetch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import z from "zod";

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginContent = () => {
  const [error, setError] = useState("");
  const { fetchApi } = useFetch();
  const { setUser, setToken, setIsAuthenticated } = useUserContext();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleLogin = async ({ email, password }: LoginFormData) => {
    setError("");

    try {
      const response = await fetchApi(
        `${import.meta.env.VITE_API_URL}/users/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        navigate("/chats", { replace: true });
        reset();

        return;
      }

      setError(data.error || "Login failed");
    } catch {
      setError("Unable to login. Check if server is running.");
    }
  };

  return (
    <form className="mt-5" onSubmit={handleSubmit(handleLogin)}>
      <CardContent>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>

        <div className="flex flex-col gap-6 mt-5">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              disabled={isSubmitting}
              {...register("email")}
              id="email"
              type="email"
              placeholder="m@example.com"
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              {/* <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a> */}
            </div>
            <Input
              disabled={isSubmitting}
              {...register("password")}
              id="password"
              type="password"
              required
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {error && <p className="text-red-500">{error}</p>}
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 mt-5">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer w-full"
        >
          Login
          {isSubmitting && <Spinner data-icon="inline-start" />}
        </Button>
      </CardFooter>
    </form>
  );
};

export default LoginContent;
