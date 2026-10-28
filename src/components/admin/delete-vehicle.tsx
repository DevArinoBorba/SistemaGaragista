"use client";
import { useActionState, useRef } from "react";
import { deleteVehicleAction } from "@/features/vehicles/actions";

export function DeleteVehicle({ id, title }: { id: string; title: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState(deleteVehicleAction, {});
  return <><button className="text-button danger" type="button" onClick={() => dialog.current?.showModal()}>Remover</button><dialog ref={dialog} aria-labelledby={`delete-title-${id}`} aria-describedby={`delete-desc-${id}`}>
    <h2 id={`delete-title-${id}`}>Remover veículo?</h2><p id={`delete-desc-${id}`}>{title} será retirado do estoque. Esta ação não pode ser desfeita.</p>
    <form action={action}><input type="hidden" name="id" value={id} /><input type="hidden" name="confirm" value="yes" />{state.error && <p className="form-error" role="alert">{state.error}</p>}<div className="dialog-actions"><button className="button secondary" type="button" disabled={pending} onClick={() => dialog.current?.close()}>Cancelar</button><button className="button destructive" disabled={pending}>{pending ? "Removendo…" : "Confirmar remoção"}</button></div></form>
  </dialog></>;
}
