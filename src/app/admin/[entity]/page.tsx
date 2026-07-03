import { notFound } from "next/navigation";

import { EntityTable } from "@/components/admin/EntityTable";
import { entityConfigs, isEntityKey } from "../config";
import { PAGE_SIZE, getCount, getOptions, getRows } from "../data";

export const dynamic = "force-dynamic";

type AdminEntityPageProps = {
  params: Promise<{ entity: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function AdminEntityPage({
  params,
  searchParams,
}: AdminEntityPageProps) {
  const { entity } = await params;
  if (!isEntityKey(entity)) notFound();

  const { page: pageParam } = await searchParams;
  const total = await getCount(entity);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(
    Math.max(1, Number(pageParam ?? "1") || 1),
    totalPages,
  );
  const offset = (page - 1) * PAGE_SIZE;

  const [rows, optionsByField] = await Promise.all([
    getRows(entity, { limit: PAGE_SIZE, offset }),
    getOptions(entity),
  ]);

  const config = entityConfigs[entity];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{config.label}</h1>
          <p className="text-sm text-[#606060]">
            {total} total · page {page} of {totalPages}
          </p>
        </div>
      </div>

      <EntityTable
        entity={entity}
        fields={config.fields}
        singular={config.singular}
        rows={rows}
        optionsByField={optionsByField}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
