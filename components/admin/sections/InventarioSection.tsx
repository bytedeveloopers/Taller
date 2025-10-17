"use client";

import { ArchiveBoxIcon } from "@heroicons/react/24/outline";

interface Props {
  stats: any;
}

export default function InventarioSection({ stats }: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <ArchiveBoxIcon className="h-6 w-6 mr-2 text-primary-400" />
          Inventario y Repuestos
        </h3>
        <p className="text-gray-400">Sección de inventario en desarrollo...</p>
      </div>
    </div>
  );
}
