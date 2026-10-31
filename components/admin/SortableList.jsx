'use client';

import { useEffect, useState } from 'react';

export default function SortableList({ items, onReorder, renderRow, idKey = 'id' }) {
  const [dragIndex, setDragIndex] = useState(null);
  const [local, setLocal] = useState(items);

  useEffect(() => {
    if (dragIndex !== null) return;
    setLocal(items);
  }, [items, dragIndex]);

  function onDragStart(index) {
    setDragIndex(index);
  }

  function onDragOver(e, index) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const next = [...local];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setDragIndex(index);
    setLocal(next);
  }

  async function onDragEnd() {
    setDragIndex(null);
    if (onReorder) {
      await onReorder(local.map((item) => item[idKey]));
    }
  }

  function move(index, dir) {
    const target = index + dir;
    if (target < 0 || target >= local.length) return;
    const next = [...local];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    setLocal(next);
    if (onReorder) onReorder(next.map((item) => item[idKey]));
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th style={{ width: 70 }}>Order</th>
            {renderRow(null, { header: true })}
          </tr>
        </thead>
        <tbody>
          {local.map((item, index) => (
            <tr
              key={item[idKey]}
              draggable
              onDragStart={() => onDragStart(index)}
              onDragOver={(e) => onDragOver(e, index)}
              onDragEnd={onDragEnd}
            >
              <td>
                <span className="admin-drag-handle" title="Drag to reorder">⋮⋮</span>
                <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => move(index, -1)}>↑</button>{' '}
                <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => move(index, 1)}>↓</button>
              </td>
              {renderRow(item, { header: false, index })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
