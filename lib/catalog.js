import data from './catalog.json';

const byId = Object.fromEntries(data.items.map((i) => [i.id, i]));

export function getProduct(id) {
  return byId[id] || null;
}

export function getAllIds() {
  return data.order;
}

export const order = data.order;
export const items = data.items;
