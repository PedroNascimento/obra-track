import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Font,
} from "@react-pdf/renderer";
import { FinancialSummary } from "@/domain/repositories";
import { EXPENSE_TYPE_LABELS, ExpenseType } from "@/domain/types";

// =============================================================
// Gerador de Relatório PDF — ObraTrack
// Usa @react-pdf/renderer no servidor (API Route)
// =============================================================

// Registra fonte padrão (Helvetica está disponível sem registro)
// Para usar Inter, seria necessário carregar o arquivo .ttf

// ─── Paleta de cores do relatório ───────────────────────────
const COLORS = {
  primary: "#f97316",      // laranja obra
  dark: "#1e293b",         // slate-800
  medium: "#475569",       // slate-600
  light: "#94a3b8",        // slate-400
  bg: "#f8fafc",           // slate-50
  border: "#e2e8f0",       // slate-200
  white: "#ffffff",
  positive: "#16a34a",     // green-600
};

// ─── Estilos ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: COLORS.dark,
    backgroundColor: COLORS.white,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 40,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  headerLeft: { flex: 1 },
  headerRight: { alignItems: "flex-end" },
  logoText: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: COLORS.primary,
    letterSpacing: 1,
  },
  logoSubtext: { fontSize: 9, color: COLORS.medium, marginTop: 2 },
  headerInfo: { fontSize: 8, color: COLORS.medium, marginTop: 2 },
  headerPeriod: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.dark,
  },

  // Seção
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.dark,
    backgroundColor: COLORS.bg,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },

  // Cards de resumo
  summaryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: 10,
    alignItems: "center",
  },
  summaryCardLabel: { fontSize: 7, color: COLORS.medium, marginBottom: 3 },
  summaryCardValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: COLORS.primary,
  },
  summaryCardCount: { fontSize: 7, color: COLORS.light, marginTop: 2 },

  // Tabelas
  table: { width: "100%" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.dark,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 2,
    marginBottom: 1,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLORS.white,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableRowAlt: { backgroundColor: COLORS.bg },
  tableCell: { fontSize: 8, color: COLORS.dark },
  tableCellRight: { fontSize: 8, color: COLORS.dark, textAlign: "right" },

  // Colunas da tabela principal
  colDate: { width: "12%" },
  colType: { width: "15%" },
  colCategory: { width: "18%" },
  colDescription: { flex: 1 },
  colAmount: { width: "13%", textAlign: "right" },

  // Tabelas de resumo (2 colunas)
  colSummaryLabel: { flex: 1 },
  colSummaryCount: { width: "15%", textAlign: "center" },
  colSummaryTotal: { width: "20%", textAlign: "right" },

  // Total
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
  },
  totalLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.medium,
    marginRight: 12,
  },
  totalValue: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: COLORS.primary,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
  },
  footerText: { fontSize: 7, color: COLORS.light },
});

// ─── Formatadores ─────────────────────────────────────────────
function formatCurrency(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR");
}

// ─── Interfaces de entrada ────────────────────────────────────
export interface ExpenseReportItem {
  id: string;
  expenseDate: Date;
  type: ExpenseType;
  categoryName?: string | null;
  description: string;
  amount: number;
}

export interface GenerateReportInput {
  userName: string;
  userEmail: string;
  summary: FinancialSummary;
  expenses: ExpenseReportItem[];
  generatedAt?: Date;
}

// ─── Componente do Documento ──────────────────────────────────
function ExpenseReportDocument({ input }: { input: GenerateReportInput }) {
  const generatedAt = input.generatedAt ?? new Date();

  return (
    <Document
      title={`ObraTrack — Relatório ${input.summary.periodLabel}`}
      author="ObraTrack"
      subject="Relatório de Gastos de Obra"
    >
      <Page size="A4" style={styles.page}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.logoText}>ObraTrack</Text>
            <Text style={styles.logoSubtext}>Controle Financeiro de Obras</Text>
            <Text style={[styles.headerInfo, { marginTop: 6 }]}>
              Usuário: {input.userName} ({input.userEmail})
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerPeriod}>{input.summary.periodLabel}</Text>
            <Text style={styles.headerInfo}>
              Gerado em: {formatDate(generatedAt)}{" "}
              às {generatedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
        </View>

        {/* ── Cards de Resumo ── */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardLabel}>TOTAL GERAL</Text>
            <Text style={styles.summaryCardValue}>
              {formatCurrency(input.summary.totalAmount)}
            </Text>
            <Text style={styles.summaryCardCount}>
              {input.summary.totalCount} despesa(s)
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardLabel}>PERÍODO</Text>
            <Text style={[styles.summaryCardValue, { fontSize: 11 }]}>
              {input.summary.periodLabel}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardLabel}>MAIOR CATEGORIA</Text>
            {input.summary.byCategory.length > 0 ? (
              <>
                <Text style={[styles.summaryCardValue, { fontSize: 10, color: COLORS.dark }]}>
                  {input.summary.byCategory.sort((a, b) => b.total - a.total)[0]?.categoryName ?? "Sem categoria"}
                </Text>
                <Text style={styles.summaryCardCount}>
                  {formatCurrency(input.summary.byCategory.sort((a, b) => b.total - a.total)[0]?.total ?? 0)}
                </Text>
              </>
            ) : (
              <Text style={styles.summaryCardValue}>—</Text>
            )}
          </View>
        </View>

        {/* ── Tabela Detalhada de Despesas ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Despesas Detalhadas</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colDate]}>Data</Text>
              <Text style={[styles.tableHeaderCell, styles.colType]}>Tipo</Text>
              <Text style={[styles.tableHeaderCell, styles.colCategory]}>Categoria</Text>
              <Text style={[styles.tableHeaderCell, styles.colDescription]}>Descrição</Text>
              <Text style={[styles.tableHeaderCell, styles.colAmount]}>Valor</Text>
            </View>
            {input.expenses.map((exp, i) => (
              <View key={exp.id} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                <Text style={[styles.tableCell, styles.colDate]}>
                  {formatDate(exp.expenseDate)}
                </Text>
                <Text style={[styles.tableCell, styles.colType]}>
                  {EXPENSE_TYPE_LABELS[exp.type]}
                </Text>
                <Text style={[styles.tableCell, styles.colCategory]}>
                  {exp.categoryName ?? "—"}
                </Text>
                <Text style={[styles.tableCell, styles.colDescription]}>
                  {exp.description}
                </Text>
                <Text style={[styles.tableCellRight, styles.colAmount]}>
                  {formatCurrency(exp.amount)}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL DO PERÍODO</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(input.summary.totalAmount)}
            </Text>
          </View>
        </View>

        {/* ── Resumo por Tipo ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo por Tipo de Despesa</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colSummaryLabel]}>Tipo</Text>
              <Text style={[styles.tableHeaderCell, styles.colSummaryCount]}>Qtd.</Text>
              <Text style={[styles.tableHeaderCell, styles.colSummaryTotal]}>Total</Text>
            </View>
            {input.summary.byType
              .sort((a, b) => b.total - a.total)
              .map((item, i) => (
                <View key={item.type} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                  <Text style={[styles.tableCell, styles.colSummaryLabel]}>
                    {EXPENSE_TYPE_LABELS[item.type]}
                  </Text>
                  <Text style={[styles.tableCellRight, styles.colSummaryCount]}>
                    {item.count}
                  </Text>
                  <Text style={[styles.tableCellRight, styles.colSummaryTotal]}>
                    {formatCurrency(item.total)}
                  </Text>
                </View>
              ))}
          </View>
        </View>

        {/* ── Resumo por Categoria ── */}
        {input.summary.byCategory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumo por Categoria</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.colSummaryLabel]}>Categoria</Text>
                <Text style={[styles.tableHeaderCell, styles.colSummaryCount]}>Qtd.</Text>
                <Text style={[styles.tableHeaderCell, styles.colSummaryTotal]}>Total</Text>
              </View>
              {input.summary.byCategory
                .sort((a, b) => b.total - a.total)
                .map((item, i) => (
                  <View key={item.categoryId ?? "none"} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                    <Text style={[styles.tableCell, styles.colSummaryLabel]}>
                      {item.categoryName ?? "Sem categoria"}
                    </Text>
                    <Text style={[styles.tableCellRight, styles.colSummaryCount]}>
                      {item.count}
                    </Text>
                    <Text style={[styles.tableCellRight, styles.colSummaryTotal]}>
                      {formatCurrency(item.total)}
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        )}

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>ObraTrack — Controle Financeiro de Obras</Text>
          <Text style={styles.footerText}>
            {input.userName} · {formatDate(generatedAt)}
          </Text>
        </View>

      </Page>
    </Document>
  );
}

// ─── Função pública: gera o PDF como Buffer ───────────────────
export async function generateExpenseReportPDF(input: GenerateReportInput): Promise<Buffer> {
  const buffer = await renderToBuffer(<ExpenseReportDocument input={input} />);
  return buffer;
}
