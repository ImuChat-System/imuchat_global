/**
 * SpreadsheetScreen — Tableur WebView
 *
 * Architecture hybride :
 *  - L'UI du tableur est rendue en HTML/CSS dans une WebView
 *  - Le bridge natif ↔ WebView permet : sauvegarde, formules, export
 *  - La barre de formules est native (TextInput)
 *
 * Phase — DEV-019 Module Office
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useToast } from "@/providers/ToastProvider";
import * as OfficeAPI from "@/services/office-api";
import { useOfficeStore } from "@/stores/office-store";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

import type { SpreadsheetData } from "@/types/office";

// ─── WebView HTML template ──────────────────────────────────

function generateSpreadsheetHTML(
  data: SpreadsheetData,
  themeColors: {
    bg: string;
    text: string;
    border: string;
    cell: string;
    header: string;
    selected: string;
  },
): string {
  const rows = data.rows;
  const cols = data.columns;

  // Build column letters
  const colLetters = Array.from({ length: cols }, (_, i) =>
    String.fromCharCode(65 + i),
  );

  // Build cell grid HTML
  let cellsHTML = "";
  for (let r = 0; r < rows; r++) {
    let rowHTML = `<tr><td class="row-header">${r + 1}</td>`;
    for (let c = 0; c < cols; c++) {
      const key = `${colLetters[c]}${r + 1}`;
      const cell = data.cells[key];
      const value = cell ? cell.value : "";
      rowHTML += `<td class="cell" data-key="${key}" onclick="selectCell('${key}')">${value}</td>`;
    }
    rowHTML += "</tr>";
    cellsHTML += rowHTML;
  }

  return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, sans-serif; background: ${themeColors.bg}; color: ${themeColors.text}; overflow: auto; }
  .grid-container { overflow: auto; width: 100%; height: 100vh; }
  table { border-collapse: collapse; width: max-content; }
  th, td { border: 1px solid ${themeColors.border}; padding: 6px 10px; min-width: 80px; font-size: 14px; text-align: left; }
  th { background: ${themeColors.header}; font-weight: 600; position: sticky; top: 0; z-index: 2; }
  .row-header { background: ${themeColors.header}; font-weight: 600; min-width: 40px; text-align: center; position: sticky; left: 0; z-index: 1; }
  .cell { background: ${themeColors.cell}; cursor: pointer; }
  .cell.selected { outline: 2px solid ${themeColors.selected}; outline-offset: -2px; }
  .corner { background: ${themeColors.header}; position: sticky; left: 0; top: 0; z-index: 3; }
</style>
</head>
<body>
<div class="grid-container">
<table>
  <thead>
    <tr>
      <th class="corner"></th>
      ${colLetters.map((l) => `<th>${l}</th>`).join("")}
    </tr>
  </thead>
  <tbody>
    ${cellsHTML}
  </tbody>
</table>
</div>
<script>
  let selectedKey = null;

  function selectCell(key) {
    document.querySelectorAll('.cell').forEach(c => c.classList.remove('selected'));
    const el = document.querySelector('[data-key="' + key + '"]');
    if (el) {
      el.classList.add('selected');
      selectedKey = key;
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'cell_selected', key, value: el.textContent }));
    }
  }

  function updateCell(key, value) {
    const el = document.querySelector('[data-key="' + key + '"]');
    if (el) el.textContent = value;
  }

  // Listen for messages from RN
  window.addEventListener('message', function(e) {
    try {
      const msg = JSON.parse(e.data);
      if (msg.type === 'update_cell') {
        updateCell(msg.key, msg.value);
      }
    } catch(err) {}
  });
</script>
</body>
</html>`;
}

export default function SpreadsheetScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();
  const { showToast } = useToast();
  const { docId, isNew } = useLocalSearchParams<{
    docId?: string;
    isNew?: string;
  }>();

  const {
    currentDocument,
    openDocument,
    closeDocument,
    createDocument,
    updateDocument,
  } = useOfficeStore();

  const webViewRef = useRef<WebView>(null);
  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetData>(
    OfficeAPI.createEmptySpreadsheet(20, 10),
  );
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [formulaInput, setFormulaInput] = useState("");
  const [title, setTitle] = useState(t("office.newSpreadsheet"));
  const [docIdState, setDocIdState] = useState<string | null>(docId || null);

  // ─── Load document ──────────────────────────────────────
  useEffect(() => {
    if (docId && !isNew) {
      openDocument(docId);
    }
    return () => closeDocument();
  }, [docId, isNew, openDocument, closeDocument]);

  useEffect(() => {
    if (currentDocument && currentDocument.type === "spreadsheet") {
      setTitle(currentDocument.title);
      try {
        const parsed = JSON.parse(currentDocument.content || "{}");
        if (parsed.cells) {
          setSpreadsheetData(parsed);
        }
      } catch {
        // ignore parse errors
      }
      setDocIdState(currentDocument.id);
    }
  }, [currentDocument]);

  // ─── Cell value helper (for formula engine) ─────────────
  const getCellValue = useCallback(
    (key: string): number => {
      const cell = spreadsheetData.cells[key];
      if (!cell) return 0;
      const num = parseFloat(String(cell.value));
      return isNaN(num) ? 0 : num;
    },
    [spreadsheetData],
  );

  // ─── Handle WebView messages ────────────────────────────
  const handleWebViewMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data);
        if (msg.type === "cell_selected") {
          setSelectedCell(msg.key);
          const cell = spreadsheetData.cells[msg.key];
          setFormulaInput(cell ? String(cell.formula || cell.value || "") : "");
        }
      } catch {
        // ignore
      }
    },
    [spreadsheetData],
  );

  // ─── Apply formula/value ────────────────────────────────
  const handleApplyFormula = useCallback(() => {
    if (!selectedCell) return;

    let value: string | number = formulaInput;

    // If it starts with =, evaluate as formula
    if (formulaInput.startsWith("=")) {
      const result = OfficeAPI.evaluateFormula(formulaInput, getCellValue);
      value = result;
    }

    // Update local data
    setSpreadsheetData((prev) => {
      const next = { ...prev, cells: { ...prev.cells } };
      next.cells[selectedCell] = {
        ...(next.cells[selectedCell] || {}),
        value,
        formula: formulaInput.startsWith("=") ? formulaInput : undefined,
      };
      return next;
    });

    // Update WebView
    if (webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: "update_cell",
          key: selectedCell,
          value: String(value),
        }),
      );
    }
  }, [selectedCell, formulaInput, getCellValue]);

  // ─── Save ───────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    const content = JSON.stringify(spreadsheetData);
    if (docIdState) {
      await updateDocument(docIdState, { title, content });
    } else {
      const doc = await createDocument(title, "spreadsheet", content);
      setDocIdState(doc.id);
    }
    showToast(t("office.saved"), "success");
  }, [
    spreadsheetData,
    title,
    docIdState,
    updateDocument,
    createDocument,
    showToast,
    t,
  ]);

  // ─── Theme colors for WebView ───────────────────────────
  const themeColors = {
    bg: colors.background,
    text: colors.text,
    border: colors.border,
    cell: colors.card,
    header: colors.surface,
    selected: colors.primary,
  };

  const html = generateSpreadsheetHTML(spreadsheetData, themeColors);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          testID="spreadsheet-back"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <TextInput
          testID="spreadsheet-title"
          style={[styles.titleInput, { color: colors.text }]}
          value={title}
          onChangeText={setTitle}
          placeholder={t("office.spreadsheetTitle")}
          placeholderTextColor={colors.secondaryText}
        />
        <TouchableOpacity testID="spreadsheet-save" onPress={handleSave}>
          <Ionicons name="save" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Formula bar */}
      <View
        style={[
          styles.formulaBar,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.cellLabel, { color: colors.primary }]}>
          {selectedCell || "—"}
        </Text>
        <TextInput
          testID="formula-input"
          style={[styles.formulaInput, { color: colors.text }]}
          value={formulaInput}
          onChangeText={setFormulaInput}
          onSubmitEditing={handleApplyFormula}
          placeholder="=SUM(A1:A10)"
          placeholderTextColor={colors.secondaryText + "80"}
          returnKeyType="done"
        />
        <TouchableOpacity testID="apply-formula" onPress={handleApplyFormula}>
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* WebView grid */}
      <WebView
        ref={webViewRef}
        testID="spreadsheet-webview"
        source={{ html }}
        style={styles.webView}
        originWhitelist={["*"]}
        javaScriptEnabled
        onMessage={handleWebViewMessage}
        scrollEnabled={false}
      />
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 10,
  },
  titleInput: { flex: 1, fontSize: 16, fontWeight: "600" },
  formulaBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    gap: 8,
  },
  cellLabel: {
    fontSize: 14,
    fontWeight: "700",
    minWidth: 36,
    textAlign: "center",
  },
  formulaInput: { flex: 1, fontSize: 14, paddingVertical: 4 },
  webView: { flex: 1 },
});
