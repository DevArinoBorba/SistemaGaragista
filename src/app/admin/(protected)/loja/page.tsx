import { StoreForm } from "@/components/admin/store-form";
import { requireAdminPage } from "@/features/auth/session";
import { getStoreSettings } from "@/features/store/repository";

export default async function StoreAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ salvo?: string }>;
}) {
  await requireAdminPage();
  const [params, store] = await Promise.all([searchParams, getStoreSettings()]);
  return (
    <>
      <div className="admin-title">
        <div>
          <h1>Dados da loja</h1>
          <p>Configure a identidade comercial, CNPJ, imagens e canais de atendimento.</p>
        </div>
        <div className="row-actions">
          <a className="button secondary" href="/api/admin/backup.json">Exportar JSON</a>
        </div>
      </div>
      {params.salvo && (
        <p className="success-message" role="status">
          Dados da loja salvos com sucesso.
        </p>
      )}
      <StoreForm store={store} />
    </>
  );
}
