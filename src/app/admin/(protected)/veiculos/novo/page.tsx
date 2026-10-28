import Link from "next/link";
import { VehicleForm } from "@/components/admin/vehicle-form";
import { requireAdminPage } from "@/features/auth/session";
export default async function NewVehiclePage() {
  await requireAdminPage();
  return <><Link href="/admin/veiculos" className="text-link">← Voltar ao estoque</Link><div className="form-title"><h1>Adicionar veículo</h1><p>Preencha os dados e escolha quando publicar.</p></div><VehicleForm /></>;
}
