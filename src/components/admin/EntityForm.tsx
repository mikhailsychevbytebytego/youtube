"use client";

import Link from "next/link";
import { useActionState } from "react";

import { createRow, updateRow } from "@/app/admin/actions";
import type {
  ActionState,
  AdminField,
  EntityKey,
  SelectOption,
} from "@/app/admin/config";

type Row = Record<string, unknown> & { id: string };

const INITIAL: ActionState = { success: false };

function toInputValue(field: AdminField, row: Row | null): string {
  const raw = row?.[field.name];
  if (raw == null) return "";
  if (field.type === "datetime") {
    const d = new Date(raw as string | Date);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours(),
    )}:${pad(d.getMinutes())}`;
  }
  return String(raw);
}

export function EntityForm({
  entity,
  fields,
  singular,
  optionsByField,
  row,
}: {
  entity: EntityKey;
  fields: AdminField[];
  singular: string;
  optionsByField: Record<string, SelectOption[]>;
  row: Row | null;
}) {
  const action = row
    ? updateRow.bind(null, entity, row.id)
    : createRow.bind(null, entity);

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    INITIAL,
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-xl border border-[#e5e5e5] bg-white p-5"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field.name} className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[#0f0f0f]">
              {field.label}
              {field.required && <span className="text-red-600"> *</span>}
            </span>

            {field.type === "select" ? (
              <select
                name={field.name}
                required={field.required}
                defaultValue={toInputValue(field, row)}
                className="rounded-lg border border-[#d9d9d9] px-3 py-2 outline-none focus:border-[#0f0f0f]"
              >
                <option value="">— Select —</option>
                {(optionsByField[field.name] ?? []).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                name={field.name}
                required={field.required}
                defaultValue={toInputValue(field, row)}
                rows={3}
                className="rounded-lg border border-[#d9d9d9] px-3 py-2 outline-none focus:border-[#0f0f0f]"
              />
            ) : (
              <input
                name={field.name}
                type={
                  field.type === "number"
                    ? "number"
                    : field.type === "datetime"
                      ? "datetime-local"
                      : "text"
                }
                required={field.required}
                defaultValue={toInputValue(field, row)}
                className="rounded-lg border border-[#d9d9d9] px-3 py-2 outline-none focus:border-[#0f0f0f]"
              />
            )}
          </label>
        ))}
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
        >
          {pending ? "Saving…" : row ? "Save changes" : `Create ${singular}`}
        </button>
        <Link
          href={`/admin/${entity}`}
          className="rounded-full px-5 py-2 text-sm font-semibold text-[#606060] transition-colors hover:bg-[#f2f2f2]"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
