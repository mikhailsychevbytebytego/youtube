"use client";

import { Trash2 } from "lucide-react";

export function DeleteButton({
  action,
  message,
}: {
  action: () => Promise<void>;
  message: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      <button
        type="submit"
        className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-[#cc0000] hover:bg-[#fff0f0]"
      >
        <Trash2 className="size-4" /> Delete
      </button>
    </form>
  );
}
