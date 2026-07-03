"use client";

import Image from "next/image";
import Link from "next/link";

import { deleteRow } from "@/app/admin/actions";
import type { AdminField, EntityKey, SelectOption } from "@/app/admin/config";

type Row = Record<string, unknown> & { id: string };

function renderCell(
  field: AdminField,
  row: Row,
  optionsByField: Record<string, SelectOption[]>,
) {
  const value = row[field.name];

  if (field.preview) {
    if (value == null || value === "") return <span>—</span>;
    const src = String(value);
    const href = field.linkPattern
      ? field.linkPattern.replace(/:(\w+)/g, (_, key: string) =>
          encodeURIComponent(String(row[key] ?? "")),
        )
      : undefined;
    const img = (
      <div className="relative h-10 w-16 overflow-hidden rounded bg-[#f2f2f2]">
        <Image
          src={src}
          alt=""
          fill
          sizes="64px"
          unoptimized
          className="object-cover"
        />
      </div>
    );
    if (href) {
      return (
        <a
          href={String(href)}
          target="_blank"
          rel="noreferrer"
          className="inline-block"
        >
          {img}
        </a>
      );
    }
    return img;
  }

  if (value == null || value === "") return <span>—</span>;

  if (field.type === "select") {
    const opt = optionsByField[field.name]?.find((o) => o.value === value);
    return <span>{opt ? opt.label : String(value)}</span>;
  }

  if (field.type === "datetime") {
    const d = new Date(value as string | Date);
    return <span>{Number.isNaN(d.getTime()) ? "—" : d.toLocaleString()}</span>;
  }

  const str = String(value);
  return <span>{str.length > 48 ? `${str.slice(0, 48)}…` : str}</span>;
}

export function EntityTable({
  entity,
  fields,
  singular,
  rows,
  optionsByField,
  page,
  totalPages,
}: {
  entity: EntityKey;
  fields: AdminField[];
  singular: string;
  rows: Row[];
  optionsByField: Record<string, SelectOption[]>;
  page: number;
  totalPages: number;
}) {
  const visibleFields = fields.filter((f) => !f.hideInTable);
  const previewFields = visibleFields.filter((f) => f.preview);
  const otherFields = visibleFields.filter((f) => !f.preview);
  // Preview (thumbnail) columns render first, then ID, then everything else.
  const orderedFields = [...previewFields, ...otherFields];
  const columnCount = orderedFields.length + 2; // + ID + Actions

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link
          href={`/admin/${entity}/new`}
          className="inline-block rounded-full bg-[#0f0f0f] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-black"
        >
          + New {singular}
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#e5e5e5] bg-white">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#e5e5e5] text-left text-[#606060]">
              {previewFields.map((field) => (
                <th key={field.name} className="px-3 py-2 font-medium">
                  {field.label}
                </th>
              ))}
              <th className="px-3 py-2 font-medium">ID</th>
              {otherFields.map((field) => (
                <th key={field.name} className="px-3 py-2 font-medium">
                  {field.label}
                </th>
              ))}
              <th className="px-3 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columnCount}
                  className="px-3 py-6 text-center text-[#606060]"
                >
                  No rows yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[#f2f2f2] last:border-0 hover:bg-[#fafafa]"
                >
                  {previewFields.map((field) => (
                    <td key={field.name} className="px-3 py-2 align-middle">
                      {renderCell(field, row, optionsByField)}
                    </td>
                  ))}
                  <td className="px-3 py-2 font-mono text-xs text-[#909090]">
                    {row.id.slice(0, 8)}
                  </td>
                  {otherFields.map((field) => (
                    <td key={field.name} className="px-3 py-2 align-middle">
                      {renderCell(field, row, optionsByField)}
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/${entity}/${row.id}`}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-[#0f0f0f] hover:bg-[#f0f0f0]"
                      >
                        Edit
                      </Link>
                      <form
                        action={deleteRow.bind(null, entity, row.id)}
                        onSubmit={(e) => {
                          if (!confirm(`Delete this ${singular.toLowerCase()}?`)) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <button
                          type="submit"
                          className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 ? (
            <Link
              href={`/admin/${entity}?page=${page - 1}`}
              className="rounded-lg border border-[#e5e5e5] bg-white px-3 py-1.5 text-sm font-medium hover:bg-[#f2f2f2]"
            >
              ← Prev
            </Link>
          ) : (
            <span className="rounded-lg border border-[#f0f0f0] bg-white px-3 py-1.5 text-sm font-medium text-[#c0c0c0]">
              ← Prev
            </span>
          )}

          <span className="px-2 text-sm text-[#606060]">
            Page {page} of {totalPages}
          </span>

          {page < totalPages ? (
            <Link
              href={`/admin/${entity}?page=${page + 1}`}
              className="rounded-lg border border-[#e5e5e5] bg-white px-3 py-1.5 text-sm font-medium hover:bg-[#f2f2f2]"
            >
              Next →
            </Link>
          ) : (
            <span className="rounded-lg border border-[#f0f0f0] bg-white px-3 py-1.5 text-sm font-medium text-[#c0c0c0]">
              Next →
            </span>
          )}
        </div>
      )}
    </div>
  );
}
