"use client";

import { useActionState } from "react";
import type { User } from "@/db/schema";
import type { FormState } from "@/app/admin/actions";
import {
  errorClass,
  inputClass,
  labelClass,
  submitClass,
} from "./form-styles";

export function UserForm({
  action,
  user,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  user?: User;
}) {
  const [state, formAction, pending] = useActionState(action, {
    error: null,
  });

  return (
    <form action={formAction} className="flex w-full max-w-xl flex-col gap-4">
      {state.error && <p className={errorClass}>{state.error}</p>}
      <label className={labelClass}>
        Name
        <input
          name="name"
          defaultValue={user?.name}
          required
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Email
        <input
          name="email"
          type="email"
          defaultValue={user?.email}
          required
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Avatar URL
        <input
          name="avatarUrl"
          defaultValue={user?.avatarUrl ?? ""}
          placeholder="/images/avatar-user.png"
          className={inputClass}
        />
      </label>
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Saving..." : user ? "Save changes" : "Create user"}
      </button>
    </form>
  );
}
