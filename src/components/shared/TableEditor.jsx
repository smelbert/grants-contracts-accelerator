import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export default function TableEditor({ value = [], onChange, readOnly = false }) {
  const [data, setData] = useState(value.length > 0 ? value : [
    { cells: ['', '', ''] }
  ]);

  const handleCellChange = (rowIndex, cellIndex, newValue) => {
    const newData = [...data];
    newData[rowIndex].cells[cellIndex] = newValue;
    setData(newData);
    onChange(newData);
  };

  const addRow = () => {
    const newData = [...data];
    newData.push({ cells: Array(data[0]?.cells?.length || 3).fill('') });
    setData(newData);
    onChange(newData);
  };

  const addColumn = () => {
    const newData = data.map(row => ({
      cells: [...row.cells, '']
    }));
    setData(newData);
    onChange(newData);
  };

  const deleteRow = (index) => {
    if (data.length <= 1) return;
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
    onChange(newData);
  };

  const deleteColumn = (index) => {
    if (data[0]?.cells?.length <= 1) return;
    const newData = data.map(row => ({
      cells: row.cells.filter((_, i) => i !== index)
    }));
    setData(newData);
    onChange(newData);
  };

  if (readOnly) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-slate-300">
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex === 0 ? 'bg-slate-100 font-semibold' : ''}>
                {row.cells.map((cell, cellIndex) => (
                  <td key={cellIndex} className="border border-slate-300 px-4 py-2">
                    {cell || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-slate-300">
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex === 0 ? 'bg-slate-50' : ''}>
                <td className="border-0 px-2 py-2 w-10">
                  <div className="flex flex-col gap-1">
                    <GripVertical className="w-4 h-4 text-slate-400" />
                    {data.length > 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteRow(rowIndex)}
                        className="h-6 w-6 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </td>
                {row.cells.map((cell, cellIndex) => (
                  <td key={cellIndex} className="border border-slate-300 p-1">
                    <Input
                      value={cell}
                      onChange={(e) => handleCellChange(rowIndex, cellIndex, e.target.value)}
                      className="border-0 focus-visible:ring-0"
                      placeholder={rowIndex === 0 ? 'Header' : 'Cell'}
                    />
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="border-0 px-2 py-2"></td>
              {data[0]?.cells.map((_, cellIndex) => (
                <td key={cellIndex} className="border-0 p-1 text-center">
                  {data[0]?.cells.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteColumn(cellIndex)}
                      className="text-red-500 hover:text-red-700 h-6"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={addRow}>
          <Plus className="w-4 h-4 mr-1" />
          Add Row
        </Button>
        <Button size="sm" variant="outline" onClick={addColumn}>
          <Plus className="w-4 h-4 mr-1" />
          Add Column
        </Button>
      </div>
    </div>
  );
}