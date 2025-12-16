"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import type { TableBlockPayload, TableRow, TableCell } from '@/lib/blocks/types';

interface TableBlockEditorProps {
  initialPayload?: TableBlockPayload;
  onChange: (payload: TableBlockPayload) => void;
}

/**
 * Editor de bloco table (NÃO usa Lexical)
 */
export default function TableBlockEditor({
  initialPayload,
  onChange,
}: TableBlockEditorProps) {
  const [rows, setRows] = useState<TableRow[]>(
    initialPayload?.rows || [{ cells: [{ content: '' }] }]
  );
  const [columns, setColumns] = useState(initialPayload?.columns || 2);
  const [hasHeaders, setHasHeaders] = useState(initialPayload?.headers || false);

  const updateRows = (newRows: TableRow[]) => {
    setRows(newRows);
    onChange({
      rows: newRows,
      columns,
      headers: hasHeaders,
    });
  };

  const addRow = () => {
    const newRow: TableRow = {
      cells: Array.from({ length: columns }, () => ({ content: '' })),
    };
    updateRows([...rows, newRow]);
  };

  const removeRow = (index: number) => {
    updateRows(rows.filter((_, i) => i !== index));
  };

  const updateCell = (rowIndex: number, cellIndex: number, content: string) => {
    const newRows = [...rows];
    if (!newRows[rowIndex]) {
      newRows[rowIndex] = { cells: [] };
    }
    if (!newRows[rowIndex].cells[cellIndex]) {
      newRows[rowIndex].cells[cellIndex] = { content: '' };
    }
    newRows[rowIndex].cells[cellIndex].content = content;
    updateRows(newRows);
  };

  const updateColumns = (newColumns: number) => {
    setColumns(newColumns);
    const newRows = rows.map((row) => ({
      ...row,
      cells: Array.from({ length: newColumns }, (_, i) => 
        row.cells[i] || { content: '' }
      ),
    }));
    updateRows(newRows);
  };

  return (
    <div className="table-block-editor space-y-4 p-4 border rounded-lg">
      <div className="flex gap-4 items-end">
        <div>
          <Label htmlFor="table-columns">Número de Colunas</Label>
          <Input
            id="table-columns"
            type="number"
            min="1"
            max="10"
            value={columns}
            onChange={(e) => updateColumns(parseInt(e.target.value) || 1)}
            className="mt-1 w-24"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="table-headers"
            checked={hasHeaders}
            onChange={(e) => {
              setHasHeaders(e.target.checked);
              onChange({ rows, columns, headers: e.target.checked });
            }}
          />
          <Label htmlFor="table-headers">Primeira linha é cabeçalho</Label>
        </div>
      </div>

      <div className="border rounded overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, cellIndex) => (
                  <td key={cellIndex} className="border p-2">
                    <Input
                      value={row.cells[cellIndex]?.content || ''}
                      onChange={(e) => updateCell(rowIndex, cellIndex, e.target.value)}
                      placeholder={`Célula ${rowIndex + 1},${cellIndex + 1}`}
                      className="border-0 p-1 focus:ring-1"
                    />
                  </td>
                ))}
                <td className="border p-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRow(rowIndex)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button type="button" onClick={addRow} variant="outline" size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Linha
      </Button>
    </div>
  );
}


