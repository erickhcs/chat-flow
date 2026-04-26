import { useState } from "react";
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
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const NAME_MAX_LENGTH = 50;

const signUpSchema = z
  .object({
    name: z
      .string()
      .min(5, "Name must be at least 5 characters")
      .max(NAME_MAX_LENGTH, "Name must be at most 50 characters"),
    email: z.email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

const SignUpContent = () => {
  const navigate = useNavigate();
  const { fetchApi } = useFetch();
  const [error, setError] = useState("");
  const { setUser, setToken, setIsAuthenticated } = useUserContext();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const handleSignUp = async ({ name, email, password }: SignUpFormData) => {
    setError("");

    try {
      const response = await fetchApi(
        `${import.meta.env.VITE_API_URL}/users/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
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

      setError(data.error || "Sign up failed");
    } catch {
      setError("Unable to create account.");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSignUp)}>
      <CardContent>
        <CardTitle>Sign Up for an account</CardTitle>
        <CardDescription>
          Enter your email below to create a new account
        </CardDescription>

        <div className="flex flex-col gap-6 mt-5">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              maxLength={NAME_MAX_LENGTH}
              {...register("name")}
              disabled={isSubmitting}
              id="name"
              type="text"
              placeholder="John Doe"
              required
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              {...register("email")}
              disabled={isSubmitting}
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
            </div>
            <Input
              {...register("password")}
              disabled={isSubmitting}
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

          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
            </div>
            <Input
              {...register("confirmPassword")}
              disabled={isSubmitting}
              id="confirmPassword"
              type="password"
              required
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {error && <p className="text-red-500">{error}</p>}
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 mt-5">
        <Button
          disabled={isSubmitting}
          className="cursor-pointer w-full"
          type="submit"
        >
          Sign Up
          {isSubmitting && <Spinner data-icon="inline-start" />}
        </Button>
      </CardFooter>
    </form>
  );
};

export default SignUpContent;
