import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { VehicleForm } from "@/components/admin/vehicle-form";
import { requireAdminPage } from "@/features/auth/session";
import { findVehicle } from "@/features/vehicles/repository";
export default async function EditVehiclePage({ params }: PageProps<"/admin/veiculos/[id]/editar">) {
  await requireAdminPage();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const vehicle = await findVehicle(id, false);
  if (!vehicle) notFound();
  return <><Link href="/admin/veiculos" className="text-link">← Voltar ao estoque</Link><div className="form-title"><h1>Editar veículo</h1><p>{vehicle.brand} {vehicle.model} · {vehicle.modelYear}</p></div><VehicleForm vehicle={vehicle} /></>;
}
