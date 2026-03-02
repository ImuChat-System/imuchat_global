/**
 * Office Section Layout
 *
 * Stack layout for Office screens:
 *  - index (hub documentaire)
 *  - editor (éditeur texte riche)
 *  - journal (journal privé)
 *  - pdf-viewer (lecteur PDF + annotations)
 *  - spreadsheet (tableur WebView)
 *  - presentation (présentations WebView)
 *  - signature (pad de signature)
 *
 * Phase — DEV-019 Module Office
 */

import { useColors } from "@/providers/ThemeProvider";
import { Stack } from "expo-router";
import React from "react";

export default function OfficeLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "📝 Office",
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="editor"
        options={{
          title: "Éditeur",
        }}
      />
      <Stack.Screen
        name="journal"
        options={{
          title: "Journal",
        }}
      />
      <Stack.Screen
        name="pdf-viewer"
        options={{
          title: "PDF",
        }}
      />
      <Stack.Screen
        name="spreadsheet"
        options={{
          title: "Tableur",
        }}
      />
      <Stack.Screen
        name="presentation"
        options={{
          title: "Présentation",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="signature"
        options={{
          title: "Signature",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
