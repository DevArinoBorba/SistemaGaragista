import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";

export function Pagination({
  page,
  hasNext,
  path,
  query = "",
  params = {},
  anchor = "",
}: {
  page: number;
  hasNext: boolean;
  path: string;
  query?: string;
  params?: Record<string, string | undefined>;
  anchor?: string;
}) {
  if (page === 1 && !hasNext) return null;
  const extra = Object.fromEntries(Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1])));
  const url = (target: number) =>
    `${path}?${new URLSearchParams({ pagina: String(target), ...(query ? { q: query } : {}), ...extra })}${anchor}`;
  return (
    <nav className="pagination" aria-label="Paginação do estoque">
      {page > 1 && (
        <Link className="button secondary" href={url(page - 1)}>
          <ArrowLeftIcon /> Anterior
        </Link>
      )}
      <span>Página {page}</span>
      {hasNext && (
        <Link className="button primary" href={url(page + 1)}>
          Próxima <ArrowRightIcon />
        </Link>
      )}
    </nav>
  );
}
