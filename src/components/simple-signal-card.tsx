import React from "react";

export function SimpleSignalCard({ signal }) {
  return (
    <div className="border rounded p-4 mb-2">
      <div className="font-bold">{signal.name}</div>
      <div>Casa: {signal.house}</div>
      <div>Jogo: {signal.game}</div>
      <div>Data: {signal.date}</div>
      <div>Horário: {signal.time}</div>
      <div>Mercado: {signal.market}</div>
      <div>Odd: {signal.odd}</div>
      <div>Status: {signal.status}</div>
    </div>
  );
}
