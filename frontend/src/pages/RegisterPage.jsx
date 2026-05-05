import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import { api } from "../services/api.js";
import { deviceId } from "../utils/device.js";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["STUDENT", "PARENT"]),
});

export default function RegisterPage() {
  const nav = useNavigate();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", role: "STUDENT" },
  });

  async function onSubmit(values) {
    await api.post("/api/auth/register", { ...values, deviceId: deviceId() });
    nav("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-card border border-border bg-surface shadow-soft p-6">
        <h1 className="font-display text-2xl">Create account</h1>
        <p className="text-muted mt-1">Device verification is required before login</p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input label="Full name" error={form.formState.errors.name?.message} {...form.register("name")} />
          <Input label="Email" type="email" error={form.formState.errors.email?.message} {...form.register("email")} />
          <Input
            label="Password"
            type="password"
            error={form.formState.errors.password?.message}
            {...form.register("password")}
          />

          <div>
            <label className="text-sm text-muted">Role</label>
            <select
              className="mt-1 w-full rounded-control border border-border bg-surface2 px-3 py-2 outline-none focus:ring-2 focus:ring-accent/40 transition duration-200 ease-smooth"
              {...form.register("role")}
            >
              <option value="STUDENT">Student</option>
              <option value="PARENT">Parent</option>
            </select>
            {form.formState.errors.role?.message ? (
              <div className="text-danger text-sm mt-1">{form.formState.errors.role.message}</div>
            ) : null}
          </div>

          <div className="text-sm text-muted">
            Device ID: <span className="font-mono">{deviceId()}</span>
          </div>

          <Button type="submit" loading={form.formState.isSubmitting} className="w-full">
            Register
          </Button>
        </form>

        <div className="mt-4 text-sm text-muted">
          Already have an account?{" "}
          <Link className="text-accent hover:underline" to="/login">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

