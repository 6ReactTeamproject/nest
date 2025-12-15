export const getPaginatedItems = (items, currentPage, itemsPerPage) => {
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  return items.slice(indexOfFirstItem, indexOfLastItem);
};

export const getTotalPages = (totalItems, itemsPerPage) => {
  return Math.ceil(totalItems.length / itemsPerPage);
};
