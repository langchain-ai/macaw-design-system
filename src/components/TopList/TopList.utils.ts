import type { TopListItem, TopListSort } from './TopList.types';

export const sortTopListItems = <Item extends TopListItem>(
  items: readonly Item[],
  sort: TopListSort<Item>
): readonly Item[] => {
  const sortedItems = [...items];
  if (sort === 'none') return sortedItems;

  if (typeof sort === 'function') return sortedItems.sort(sort);
  if (sort === 'ascending') {
    return sortedItems.sort((left, right) => left.value - right.value);
  }

  return sortedItems.sort((left, right) => right.value - left.value);
};

export const limitTopListItems = <Item extends TopListItem>(
  items: readonly Item[],
  limit: number | undefined
): readonly Item[] => {
  if (limit == null || !Number.isFinite(limit)) return items;
  return items.slice(0, Math.max(0, Math.floor(limit)));
};
