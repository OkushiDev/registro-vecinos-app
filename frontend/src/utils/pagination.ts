export const displayedRowsLabel = ({ from, to, count }: { from: number; to: number; count: number }) =>
  `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`;

export const usePagination = (setPage: (p: number) => void, setRowsPerPage: (r: number) => void) => ({
  handleChangePage: (_event: unknown, newPage: number) => setPage(newPage),
  handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  },
});
