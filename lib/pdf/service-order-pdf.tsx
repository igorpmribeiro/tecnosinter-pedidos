import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type {
  Order,
  OrderItem,
  Product,
  Supplier,
  Department,
  Requester,
  Reason,
  User,
} from "@/lib/generated/prisma";

type FullOrder = Order & {
  supplier: Supplier;
  department: Department;
  requester: Requester;
  reason: Reason;
  reviewedBy: Pick<User, "name"> | null;
  items: (OrderItem & { product: Product })[];
};

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#0891b2",
    borderBottomStyle: "solid",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandBadge: {
    backgroundColor: "#0891b2",
    color: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 2,
    fontWeight: "bold",
    fontSize: 18,
  },
  brandText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0891b2",
  },
  brandSub: {
    fontSize: 8,
    color: "#666",
  },
  titleBlock: {
    alignItems: "flex-end",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0891b2",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 9,
    color: "#666",
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    marginBottom: 10,
  },
  metaCell: {
    width: "33.33%",
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: "#000",
    borderRightStyle: "solid",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
  },
  metaCellLast: {
    borderRightWidth: 0,
  },
  metaLabel: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#666",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  metaValue: {
    fontSize: 10,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    backgroundColor: "#0891b2",
    color: "#fff",
    paddingHorizontal: 6,
    paddingVertical: 4,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  sectionBox: {
    borderWidth: 1,
    borderColor: "#000",
    borderTopWidth: 0,
    borderStyle: "solid",
    padding: 8,
    marginBottom: 10,
    minHeight: 30,
  },
  itemTable: {
    borderWidth: 1,
    borderColor: "#000",
    borderTopWidth: 0,
    borderStyle: "solid",
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
  },
  itemRowLast: {
    borderBottomWidth: 0,
  },
  itemTh: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
    padding: 5,
    fontSize: 9,
    borderRightWidth: 1,
    borderRightColor: "#000",
    borderRightStyle: "solid",
  },
  itemTd: {
    padding: 5,
    fontSize: 9,
    borderRightWidth: 1,
    borderRightColor: "#000",
    borderRightStyle: "solid",
  },
  thLast: { borderRightWidth: 0 },
  colNum: { width: "8%", textAlign: "center" },
  colQty: { width: "12%", textAlign: "center" },
  colUnit: { width: "10%", textAlign: "center" },
  colDesc: { width: "70%" },
  executionRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#000",
    borderTopWidth: 0,
    borderStyle: "solid",
    marginBottom: 10,
  },
  executionCell: {
    flex: 1,
    padding: 8,
    minHeight: 38,
    borderRightWidth: 1,
    borderRightColor: "#000",
    borderRightStyle: "solid",
  },
  executionCellLast: {
    borderRightWidth: 0,
  },
  fieldLabel: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#666",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  obsBox: {
    borderWidth: 1,
    borderColor: "#000",
    borderTopWidth: 0,
    borderStyle: "solid",
    minHeight: 70,
    padding: 8,
    marginBottom: 14,
  },
  sigRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
  },
  sigBox: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: "#000",
    borderTopStyle: "solid",
    paddingTop: 4,
    marginTop: 30,
  },
  sigLabel: {
    fontSize: 8,
    textAlign: "center",
    color: "#333",
  },
  footer: {
    marginTop: 14,
    fontSize: 7,
    color: "#888",
    textAlign: "center",
  },
});

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function fmtDate(d: Date | null | undefined): string {
  if (!d) return "—";
  return dateFmt.format(d instanceof Date ? d : new Date(d));
}

function ServiceOrderDoc({ order }: { order: FullOrder }) {
  const today = new Date();
  const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);
  const osNumber = `OS-${order.orderNumber}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <Text style={styles.brandBadge}>T</Text>
            <View>
              <Text style={styles.brandText}>Tecnosinter</Text>
              <Text style={styles.brandSub}>Tecnologia em Mineração</Text>
            </View>
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>ORDEM DE SERVIÇO</Text>
            <Text style={styles.subtitle}>
              Nº {osNumber} · Emitida em {fmtDate(today)}
            </Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>Pedido vinculado</Text>
            <Text style={styles.metaValue}>{order.orderNumber}</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>Data do pedido</Text>
            <Text style={styles.metaValue}>{fmtDate(order.orderedAt)}</Text>
          </View>
          <View style={[styles.metaCell, styles.metaCellLast]}>
            <Text style={styles.metaLabel}>Prazo de entrega</Text>
            <Text style={styles.metaValue}>{order.deliveryDays} dias</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>Solicitante</Text>
            <Text style={styles.metaValue}>{order.requester.name}</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>Departamento</Text>
            <Text style={styles.metaValue}>{order.department.name}</Text>
          </View>
          <View
            style={[
              styles.metaCell,
              styles.metaCellLast,
              { borderBottomWidth: 0 },
            ]}
          >
            <Text style={styles.metaLabel}>Centro de custo</Text>
            <Text style={styles.metaValue}>{order.costCenter ?? "—"}</Text>
          </View>
          <View style={[styles.metaCell, { borderBottomWidth: 0 }]}>
            <Text style={styles.metaLabel}>Fornecedor</Text>
            <Text style={styles.metaValue}>{order.supplier.name}</Text>
          </View>
          <View style={[styles.metaCell, { borderBottomWidth: 0 }]}>
            <Text style={styles.metaLabel}>Aprovado por</Text>
            <Text style={styles.metaValue}>
              {order.reviewedBy?.name ?? "—"}
            </Text>
          </View>
          <View
            style={[
              styles.metaCell,
              styles.metaCellLast,
              { borderBottomWidth: 0 },
            ]}
          >
            <Text style={styles.metaLabel}>Aprovado em</Text>
            <Text style={styles.metaValue}>{fmtDate(order.reviewedAt)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Descrição do serviço / aplicação</Text>
        <View style={styles.sectionBox}>
          <Text>{order.reason.description}</Text>
        </View>

        <Text style={styles.sectionTitle}>Itens / Materiais a serem aplicados</Text>
        <View style={styles.itemTable}>
          <View style={styles.itemRow}>
            <Text style={[styles.itemTh, styles.colNum]}>Item</Text>
            <Text style={[styles.itemTh, styles.colQty]}>Quant.</Text>
            <Text style={[styles.itemTh, styles.colUnit]}>Unid.</Text>
            <Text style={[styles.itemTh, styles.colDesc, styles.thLast]}>
              Descrição
            </Text>
          </View>
          {order.items.map((it, idx) => {
            const last = idx === order.items.length - 1;
            return (
              <View
                key={it.id}
                style={last ? [styles.itemRow, styles.itemRowLast] : styles.itemRow}
              >
                <Text style={[styles.itemTd, styles.colNum]}>{idx + 1}</Text>
                <Text style={[styles.itemTd, styles.colQty]}>{it.quantity}</Text>
                <Text style={[styles.itemTd, styles.colUnit]}>
                  {it.product.unit}
                </Text>
                <Text style={[styles.itemTd, styles.colDesc, styles.thLast]}>
                  {it.product.name}
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Execução</Text>
        <View style={styles.executionRow}>
          <View style={styles.executionCell}>
            <Text style={styles.fieldLabel}>Data de início</Text>
          </View>
          <View style={styles.executionCell}>
            <Text style={styles.fieldLabel}>Data de conclusão</Text>
          </View>
          <View style={[styles.executionCell, styles.executionCellLast]}>
            <Text style={styles.fieldLabel}>Executado por</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Observações</Text>
        <View style={styles.obsBox} />

        {/* signatures removed per request */}

        <Text style={styles.footer}>
          OS gerada a partir do pedido {order.orderNumber} ·{" "}
          {totalQty.toLocaleString("pt-BR")} unidades · Tecnosinter
        </Text>
      </Page>
    </Document>
  );
}

export async function renderServiceOrderPdf(order: FullOrder): Promise<Buffer> {
  return renderToBuffer(<ServiceOrderDoc order={order} />);
}
