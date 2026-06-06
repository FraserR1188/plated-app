// ================================================================
// CSV export — generates a .csv file from your meal entries
// and opens Android's share sheet so you can send it anywhere
// (email, Google Drive, WhatsApp, etc.)
// ================================================================

import * as FileSystem from 'expo-file-system';
import * as Sharing    from 'expo-sharing';
import { MealEntry }   from '../types';

function cell(v: string | number): string {
  const s = String(v);
  // Wrap in quotes if the value contains commas, quotes, or newlines
  return (s.includes(',') || s.includes('"') || s.includes('\n'))
    ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Takes an array of MealEntry objects, builds a CSV string,
 * writes it to a temp file, and opens the Android share sheet.
 */
export async function exportCSV(entries: MealEntry[]): Promise<void> {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
  );

  const header = 'date,time,meal_name,calories,protein_g,carbs_g,fat_g,source,barcode';

  const rows = sorted.map((e) => {
    const dt   = new Date(e.logged_at);
    const date = dt.toISOString().slice(0, 10);         // YYYY-MM-DD
    const time = dt.toTimeString().slice(0, 5);         // HH:MM
    return [
      cell(date),
      cell(time),
      cell(e.name),
      cell(Math.round(e.calories)),
      cell(e.protein.toFixed(1)),
      cell(e.carbs.toFixed(1)),
      cell(e.fat.toFixed(1)),
      cell(e.source),
      cell(e.barcode ?? ''),
    ].join(',');
  });

  const csv      = [header, ...rows].join('\n');
  const filename = `plated_${new Date().toISOString().slice(0, 10)}.csv`;
  const path     = FileSystem.documentDirectory + filename;

  await FileSystem.writeAsStringAsync(path, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) throw new Error('Sharing not available on this device');

  await Sharing.shareAsync(path, {
    mimeType:    'text/csv',
    dialogTitle: 'Export plated. data',
  });
}

/** Utility to filter entries to a date range before exporting */
export function filterByDateRange(
  entries: MealEntry[],
  from: string,   // 'YYYY-MM-DD'
  to: string,
): MealEntry[] {
  return entries.filter((e) => e.date >= from && e.date <= to);
}
