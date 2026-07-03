import Link from "next/link";
import { notFound } from "next/navigation";

import { EntityForm } from "@/components/admin/EntityForm";
import { entityConfigs, isEntityKey } from "../../config";
import { getOptions, getRowById } from "../../data";

export const dynamic = "force-dynamic";

type EditEntityPageProps = {
  params: Promise<{ entity: string; id: string }>;
};

export default async function EditEntityPage({ params }: EditEntityPageProps) {
  const { entity, id } = await params;
  if (!isEntityKey(entity)) notFound();

  const [row, optionsByField] = await Promise.all([
    getRowById(entity, id),
    getOptions(entity),
  ]);

  if (!row) notFound();

  const config = entityConfigs[entity];

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href={`/admin/${entity}`}
          className="text-sm text-[#606060] hover:text-[#0f0f0f]"
        >
          ← {config.label}
        </Link>
        <h1 className="text-2xl font-bold">Edit {config.singular}</h1>
        <p className="font-mono text-xs text-[#909090]">{row.id}</p>
      </div>

      <EntityForm
        entity={entity}
        fields={config.fields}
        singular={config.singular}
        optionsByField={optionsByField}
        row={row}
      />
    </div>
  );
}
