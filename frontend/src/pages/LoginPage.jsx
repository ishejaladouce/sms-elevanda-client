import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import { api } from "../services/api.js";
import { deviceId } from "../utils/device.js";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export default function LoginPage() {
  const nav = useNavigate();
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  async function onSubmit(values) {
    try {
      form.clearErrors("root");
      await api.post("/api/auth/login", { ...values, deviceId: deviceId() });
      nav("/dashboard");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Login failed. Please check your details and try again.";
      form.setError("root", { type: "server", message });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-card border border-border bg-surface shadow-soft p-6">
        <h1 className="font-display text-2xl">SMS Elevanda</h1>
        <p className="text-muted mt-1">Login to your portal</p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input label="Email" type="email" error={form.formState.errors.email?.message} {...form.register("email")} />
          <Input
            label="Password"
            type="password"
            error={form.formState.errors.password?.message}
            {...form.register("password")}
          />
          {form.formState.errors.root?.message ? (
            <div className="text-danger text-sm">{form.formState.errors.root.message}</div>
          ) : null}

          <div className="text-sm text-muted">
            Device ID: <span className="font-mono">{deviceId()}</span>
          </div>

          <Button type="submit" loading={form.formState.isSubmitting} className="w-full">
            Login
          </Button>
        </form>

        <div className="mt-4 text-sm text-muted">
          No account?{" "}
          <Link className="text-accent hover:underline" to="/register">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

