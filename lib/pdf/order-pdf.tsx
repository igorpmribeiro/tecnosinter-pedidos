import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { Order, OrderItem, Product, Supplier, Department, Requester, Reason } from "@/lib/generated/prisma";

type FullOrder = Order & {
  supplier: Supplier;
  department: Department;
  requester: Requester;
  reason: Reason;
  items: (OrderItem & { product: Product })[];
};

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 9,
    fontFamily: "Helvetica",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  brandBadge: {
    backgroundColor: "#0891b2",
    color: "#ffffff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
    fontWeight: "bold",
    fontSize: 14,
  },
  brandText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0891b2",
  },
  brandSub: {
    fontSize: 7,
    color: "#666",
  },
  orderNo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  orderNoLabel: {
    fontSize: 13,
    fontWeight: "bold",
  },
  orderNoValue: {
    fontSize: 13,
    fontWeight: "bold",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 9,
    fontWeight: "bold",
  },
  table: {
    borderStyle: "solid",
    borderColor: "#000",
    borderWidth: 1,
    marginBottom: 0,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  th: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: "#000",
    borderRightStyle: "solid",
    textAlign: "center",
  },
  td: {
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: "#000",
    borderRightStyle: "solid",
  },
  tdLast: { borderRightWidth: 0 },
  colItem: { width: "6%" },
  colQty: { width: "8%" },
  colUnit: { width: "8%" },
  colDesc: { width: "44%" },
  colPrice: { width: "12%", textAlign: "right" },
  colTotal: { width: "12%", textAlign: "right" },
  colCc: { width: "10%" },
  totalRow: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
  },
  totalLabel: {
    width: "66%",
    fontWeight: "bold",
    textAlign: "center",
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: "#000",
    borderRightStyle: "solid",
  },
  totalValue: {
    width: "24%",
    fontWeight: "bold",
    textAlign: "right",
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: "#000",
    borderRightStyle: "solid",
  },
  totalEmpty: {
    width: "10%",
    padding: 4,
  },
  section: {
    borderStyle: "solid",
    borderColor: "#000",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  twoCol: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
  },
  cell: {
    padding: 4,
    flexDirection: "row",
    gap: 4,
  },
  cellDivider: {
    borderRightWidth: 1,
    borderRightColor: "#000",
    borderRightStyle: "solid",
  },
  label: { fontWeight: "bold" },
  applicationRow: {
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    flexDirection: "row",
    gap: 4,
  },
  yellow: {
    backgroundColor: "#fff59d",
  },
  sigRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  sigBox: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    paddingTop: 30,
    paddingBottom: 2,
  },
  sigLabel: {
    fontSize: 8,
    marginTop: 4,
    textAlign: "center",
  },
  footer: {
    marginTop: 10,
    fontSize: 8,
    color: "#666",
    textAlign: "center",
  },
});

const currencyFmt = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
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
function fmtMoney(n: number): string {
  return currencyFmt.format(n);
}

function OrderDoc({ order }: { order: FullOrder }) {
  const total = order.items.reduce((sum, i) => sum + i.totalPrice, 0);
  const lastPurchase = order.items.reduce<Date | null>((max, i) => {
    const d = i.product.lastOrderedAt;
    if (!d) return max;
    const date = d instanceof Date ? d : new Date(d);
    if (!max || date > max) return date;
    return max;
  }, null);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.brand}>
            <Text style={styles.brandBadge}>T</Text>
            <View>
              <Text style={styles.brandText}>Tecnosinter</Text>
              <Text style={styles.brandSub}>Tecnologia em Mineração</Text>
            </View>
          </View>
          <View style={styles.orderNo}>
            <Text style={styles.orderNoLabel}>N° PEDIDO:</Text>
            <Text style={styles.orderNoValue}>{order.orderNumber}</Text>
          </View>
        </View>

        <View style={styles.dateRow}>
          <Text style={styles.dateText}>DATA: {fmtDate(order.orderedAt)}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.th, styles.colItem]}>Item</Text>
            <Text style={[styles.th, styles.colQty]}>Quant.</Text>
            <Text style={[styles.th, styles.colUnit]}>Unid.</Text>
            <Text style={[styles.th, styles.colDesc]}>DESCRIÇÃO</Text>
            <Text style={[styles.th, styles.colPrice]}>PREÇO UNIT</Text>
            <Text style={[styles.th, styles.colTotal]}>PREÇO TOTAL</Text>
            <Text style={[styles.th, styles.colCc, styles.tdLast]}>
              C. Custo
            </Text>
          </View>

          {order.items.map((it, idx) => (
            <View key={it.id} style={styles.tableRow}>
              <Text style={[styles.td, styles.colItem, { textAlign: "center" }]}>
                {idx + 1}
              </Text>
              <Text style={[styles.td, styles.colQty, { textAlign: "center" }]}>
                {it.quantity}
              </Text>
              <Text style={[styles.td, styles.colUnit, { textAlign: "center" }]}>
                {it.product.unit}
              </Text>
              <Text style={[styles.td, styles.colDesc]}>{it.product.name}</Text>
              <Text style={[styles.td, styles.colPrice]}>
                {fmtMoney(it.unitPrice)}
              </Text>
              <Text style={[styles.td, styles.colTotal]}>
                {fmtMoney(it.totalPrice)}
              </Text>
              <Text style={[styles.td, styles.colCc, styles.tdLast]}>
                {order.costCenter ?? ""}
              </Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>{fmtMoney(total)}</Text>
            <Text style={styles.totalEmpty}></Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.applicationRow}>
            <Text style={styles.label}>APLICAÇÃO:</Text>
            <Text>{order.reason.description}</Text>
          </View>

          <View style={styles.twoCol}>
            <View style={[styles.cell, styles.cellDivider, { width: "50%" }]}>
              <Text style={styles.label}>ÚLTIMA COMPRA:</Text>
              <Text>{fmtDate(lastPurchase)}</Text>
            </View>
            <View style={[styles.cell, { width: "50%" }]}>
              <Text style={styles.label}>FORNECEDOR:</Text>
              <Text>{order.supplier.name}</Text>
            </View>
          </View>

          <View style={styles.twoCol}>
            <View
              style={[
                styles.cell,
                styles.cellDivider,
                styles.yellow,
                { width: "50%" },
              ]}
            >
              <Text style={styles.label}>PENÚLTIMA TROCA:</Text>
              <Text>{fmtDate(order.reason.previousUsedAt)}</Text>
            </View>
            <View style={[styles.cell, styles.yellow, { width: "50%" }]}>
              <Text style={styles.label}>ÚLTIMA TROCA:</Text>
              <Text>{fmtDate(order.reason.lastUsedAt)}</Text>
            </View>
          </View>

          <View style={styles.applicationRow}>
            <Text style={styles.label}>PRAZO ENTREGA:</Text>
            <Text>{order.deliveryDays} DIAS</Text>
          </View>

          <View style={styles.twoCol}>
            <View style={[styles.cell, styles.cellDivider, { width: "50%" }]}>
              <Text style={styles.label}>Requisitante:</Text>
              <Text>{order.requester.name}</Text>
            </View>
            <View style={[styles.cell, { width: "50%" }]}>
              <Text style={styles.label}>Depto:</Text>
              <Text>{order.department.name}</Text>
            </View>
          </View>

          <View style={[styles.applicationRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.label}>Autorizado:</Text>
            <Text>{order.authorizedBy ?? ""}</Text>
          </View>
        </View>

        <View style={styles.sigRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.sigBox}></View>
            <Text style={styles.sigLabel}>Assinatura do Requisitante</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.sigBox}></View>
            <Text style={styles.sigLabel}>Responsável do Departamento</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.sigBox}></View>
            <Text style={styles.sigLabel}>Autorização da Compra</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function renderOrderPdf(order: FullOrder): Promise<Buffer> {
  return renderToBuffer(<OrderDoc order={order} />);
}
