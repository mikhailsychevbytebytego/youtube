import Link from "next/link";
import { notFound } from "next/navigation";

import { EntityForm } from "@/components/admin/EntityForm";
import { entityConfigs, isEntityKey } from "../../config";
import { getOptions } from "../../data";

export const dynamic = "force-dynamic";

type NewEntityPageProps = {
  params: Promise<{ entity: string }>;
};

export default async function NewEntityPage({ params }: NewEntityPageProps) {
  const { entity } = await params;
  if (!isEntityKey(entity)) notFound();

  const optionsByField = await getOptions(entity);
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
        <h1 className="text-2xl font-bold">New {config.singular}</h1>
      </div>

      <EntityForm
        entity={entity}
        fields={config.fields}
        singular={config.singular}
        optionsByField={optionsByField}
        row={null}
      />
    </div>
  );
}
