"use client";

import { useMemo, useState, useTransition } from "react";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { currency, formatDate, UNITS } from "@/lib/format";
import { createOrder, updateOrder } from "./actions";

const schema = z.object({
  orderNumber: z.string().trim().min(1, "Obrigatório"),
  orderedAt: z.string().trim().min(1, "Obrigatório"),
  supplierName: z.string().trim().min(1, "Obrigatório"),
  departmentName: z.string().trim().min(1, "Obrigatório"),
  requesterName: z.string().trim().min(1, "Obrigatório"),
  reasonDescription: z.string().trim().min(1, "Obrigatório"),
  deliveryDays: z.number().int().positive("Prazo inválido"),
  costCenter: z.string().optional(),
  authorizedBy: z.string().optional(),
  items: z
    .array(
      z.object({
        productName: z.string().trim().min(1, "Obrigatório"),
        unit: z.string().trim().min(1, "Obrigatório"),
        quantity: z.number().positive("> 0"),
        unitPrice: z.number().nonnegative(">= 0"),
      }),
    )
    .min(1, "Adicione ao menos 1 produto"),
});

type FormValues = z.infer<typeof schema>;

type ProductInfo = {
  name: string;
  unit: string;
  lastPrice: number | null;
  lastOrderedAt: string | null;
  lastSupplier: string | null;
  lastDeliveryDays: number | null;
};
type ReasonInfo = {
  description: string;
  lastUsedAt: string | null;
  previousUsedAt: string | null;
};

type Mode =
  | { kind: "create"; suggestedOrderNumber: string }
  | { kind: "edit"; orderId: string; initial: FormValues };

type Props = {
  products: ProductInfo[];
  suppliers: string[];
  departments: string[];
  requesters: string[];
  reasons: ReasonInfo[];
  mode: Mode;
};

export function OrderForm({
  products,
  suppliers,
  departments,
  requesters,
  reasons,
  mode,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const today = new Date().toISOString().slice(0, 10);

  const defaultValues: FormValues =
    mode.kind === "edit"
      ? mode.initial
      : {
          orderNumber: mode.suggestedOrderNumber,
          orderedAt: today,
          supplierName: "",
          departmentName: "",
          requesterName: "",
          reasonDescription: "",
          deliveryDays: 20,
          costCenter: "",
          authorizedBy: "",
          items: [{ productName: "", unit: "Unid.", quantity: 1, unitPrice: 0 }],
        };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");
  const selectedReasonDesc = watch("reasonDescription");

  const total = items.reduce(
    (sum, it) =>
      sum + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0),
    0,
  );

  const productIndex = useMemo(
    () => new Map(products.map((p) => [p.name.toLowerCase(), p])),
    [products],
  );
  const reasonMatch = useMemo(
    () =>
      reasons.find(
        (r) =>
          r.description.trim().toLowerCase() ===
          (selectedReasonDesc ?? "").trim().toLowerCase(),
      ),
    [reasons, selectedReasonDesc],
  );

  function applyProductDefaults(index: number, name: string) {
    const match = productIndex.get(name.trim().toLowerCase());
    if (match) {
      setValue(`items.${index}.unit`, match.unit, { shouldValidate: true });
      if (match.lastPrice != null) {
        setValue(`items.${index}.unitPrice`, match.lastPrice, {
          shouldValidate: true,
        });
      }
    }
  }

  function onSubmit(values: FormValues) {
    setServerError(null);
    startTransition(async () => {
      try {
        if (mode.kind === "edit") {
          await updateOrder(mode.orderId, values);
        } else {
          await createOrder(values);
        }
      } catch (err) {
        if (err instanceof Error && err.message.startsWith("NEXT_REDIRECT"))
          return;
        const msg = err instanceof Error ? err.message : "Erro ao salvar";
        setServerError(msg);
        toast.error(msg);
      }
    });
  }

  const submitLabel =
    mode.kind === "edit"
      ? isPending
        ? "Salvando…"
        : "Salvar alterações"
      : isPending
        ? "Salvando…"
        : "Salvar pedido";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <datalist id="products-list">
        {products.map((p) => (
          <option key={p.name} value={p.name} />
        ))}
      </datalist>
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/40 py-4">
          <CardTitle className="text-base">Dados do pedido</CardTitle>
          <CardDescription>
            Preencha os dados principais. Campos com sugestões puxam do
            histórico.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 md:grid-cols-3">
          <Field label="N° Pedido" error={errors.orderNumber?.message}>
            <Input
              {...register("orderNumber")}
              autoComplete="off"
              placeholder="Ex.: 012/26…"
            />
          </Field>
          <Field label="Data do pedido" error={errors.orderedAt?.message}>
            <Input type="date" {...register("orderedAt")} />
          </Field>
          <Field
            label="Prazo de entrega (dias)"
            error={errors.deliveryDays?.message}
          >
            <Input
              type="number"
              min={1}
              {...register("deliveryDays", { valueAsNumber: true })}
            />
          </Field>

          <Field label="Fornecedor" error={errors.supplierName?.message}>
            <Input
              {...register("supplierName")}
              autoComplete="off"
              list="suppliers-list"
              placeholder="Ex.: Bripeças…"
            />
            <datalist id="suppliers-list">
              {suppliers.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>
          <Field label="Departamento" error={errors.departmentName?.message}>
            <Input
              {...register("departmentName")}
              autoComplete="off"
              list="departments-list"
              placeholder="Ex.: Manut Mec…"
            />
            <datalist id="departments-list">
              {departments.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </Field>
          <Field label="Requisitante" error={errors.requesterName?.message}>
            <Input
              {...register("requesterName")}
              autoComplete="off"
              list="requesters-list"
              placeholder="Ex.: Henrique Tiago…"
            />
            <datalist id="requesters-list">
              {requesters.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </Field>

          <Field label="Centro de custo" error={errors.costCenter?.message}>
            <Input
              {...register("costCenter")}
              autoComplete="off"
              placeholder="Ex.: Manut Mec…"
            />
          </Field>
          <Field
            label="Autorizado por (opcional)"
            error={errors.authorizedBy?.message}
          >
            <Input
              {...register("authorizedBy")}
              autoComplete="off"
              placeholder="Ex.: João Silva…"
            />
          </Field>
          <div />

          <div className="md:col-span-3">
            <Field
              label="Motivo / Aplicação"
              error={errors.reasonDescription?.message}
            >
              <Input
                {...register("reasonDescription")}
                autoComplete="off"
                list="reasons-list"
                placeholder="Ex.: Troca das telas da peneira…"
              />
              <datalist id="reasons-list">
                {reasons.map((r) => (
                  <option key={r.description} value={r.description} />
                ))}
              </datalist>
              {reasonMatch && (
                <p className="mt-2 rounded-md bg-yellow-50 px-3 py-2 text-xs text-yellow-900 ring-1 ring-yellow-200">
                  <strong>Última troca:</strong>{" "}
                  {formatDate(reasonMatch.lastUsedAt)}
                  {reasonMatch.previousUsedAt ? (
                    <>
                      {" · "}
                      <strong>Penúltima troca:</strong>{" "}
                      {formatDate(reasonMatch.previousUsedAt)}
                    </>
                  ) : null}
                </p>
              )}
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border bg-muted/40 py-4">
          <div>
            <CardTitle className="text-base">Produtos</CardTitle>
            <CardDescription>
              O preço total é calculado automaticamente.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                productName: "",
                unit: "Unid.",
                quantity: 1,
                unitPrice: 0,
              })
            }
          >
            <Plus className="h-4 w-4" aria-hidden />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          {fields.map((field, index) => {
            const item = items[index];
            const match = item?.productName
              ? productIndex.get(item.productName.trim().toLowerCase())
              : null;
            const rowTotal =
              (Number(item?.quantity) || 0) * (Number(item?.unitPrice) || 0);
            return (
              <div
                key={field.id}
                className="space-y-3 rounded-lg border bg-background p-4"
              >
                <div className="grid gap-3 md:grid-cols-12">
                  <div className="md:col-span-5">
                    <Field
                      label={`Item ${index + 1} — Produto`}
                      error={errors.items?.[index]?.productName?.message}
                    >
                      <Input
                        {...register(`items.${index}.productName`, {
                          onBlur: (e) =>
                            applyProductDefaults(index, e.target.value),
                        })}
                        autoComplete="off"
                        list="products-list"
                        placeholder="Ex.: Régua de tensionamento 2500…"
                      />
                    </Field>
                  </div>
                  <div className="md:col-span-2">
                    <Field
                      label="Unidade"
                      error={errors.items?.[index]?.unit?.message}
                    >
                      <Controller
                        control={control}
                        name={`items.${index}.unit`}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {UNITS.map((u) => (
                                <SelectItem key={u.value} value={u.value}>
                                  {u.value}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>
                  </div>
                  <div className="md:col-span-2">
                    <Field
                      label="Qtd."
                      error={errors.items?.[index]?.quantity?.message}
                    >
                      <Input
                        type="number"
                        inputMode="decimal"
                        autoComplete="off"
                        step="0.01"
                        min={0}
                        {...register(`items.${index}.quantity`, {
                          valueAsNumber: true,
                        })}
                      />
                    </Field>
                  </div>
                  <div className="md:col-span-2">
                    <Field
                      label="Preço unit. (R$)"
                      error={errors.items?.[index]?.unitPrice?.message}
                    >
                      <Input
                        type="number"
                        inputMode="decimal"
                        autoComplete="off"
                        step="0.01"
                        min={0}
                        {...register(`items.${index}.unitPrice`, {
                          valueAsNumber: true,
                        })}
                      />
                    </Field>
                  </div>
                  <div className="md:col-span-1 flex items-end justify-end">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      aria-label="Remover item"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" aria-hidden />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="flex flex-wrap gap-x-3 gap-y-1">
                    {match ? (
                      <>
                        <span>
                          <strong>Última compra:</strong>{" "}
                          {formatDate(match.lastOrderedAt)}
                          {match.lastPrice != null
                            ? ` — ${currency.format(match.lastPrice)}`
                            : ""}
                        </span>
                        {match.lastSupplier && (
                          <span>
                            <strong>Último fornecedor:</strong>{" "}
                            {match.lastSupplier}
                          </span>
                        )}
                        {match.lastDeliveryDays != null && (
                          <span>
                            <strong>Último prazo:</strong>{" "}
                            {match.lastDeliveryDays} dias
                          </span>
                        )}
                      </>
                    ) : (
                      "Produto novo — será cadastrado no primeiro uso."
                    )}
                  </span>
                  <span className="font-medium text-foreground">
                    Total: {currency.format(rowTotal)}
                  </span>
                </div>
              </div>
            );
          })}

          <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/50 px-4 py-3 ring-1 ring-border">
            <span className="text-sm font-medium text-muted-foreground">
              Total do pedido
            </span>
            <span className="font-mono text-2xl font-semibold tabular-nums">
              {currency.format(total)}
            </span>
          </div>
        </CardContent>
      </Card>

      {serverError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() =>
            router.push(
              mode.kind === "edit" ? `/pedidos/${mode.orderId}` : "/pedidos",
            )
          }
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending} aria-busy={isPending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
