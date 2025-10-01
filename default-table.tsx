import { type ReactNode, useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  flexRender,
} from '@tanstack/react-table';
import {
  Box,
  Table,
  Input,
  Text,
  Spinner,
  Center,
  HStack,
  Button,
  IconButton,
  Spacer,
  createListCollection,
  ConditionalValue,
  Select,
  Checkbox,
  Menu,
  Portal,
  SimpleGrid,
  GridItem,
} from '@chakra-ui/react';
import {
  TbArrowsSort,
  TbArrowUp,
  TbArrowDown,
  TbChevronsRight,
  TbChevronRight,
  TbChevronLeft,
  TbChevronsLeft,
  TbColumns,
} from 'react-icons/tb';

const caseInsensitiveSort = (rowA: any, rowB: any, columnId: string) => {
  const valA = rowA.getValue(columnId);
  const valB = rowB.getValue(columnId);
  if (typeof valA === 'string' && typeof valB === 'string') {
    return valA.toLowerCase().localeCompare(valB.toLowerCase());
  } else if (typeof valA === 'number' && typeof valB === 'number') {
    return valA > valB ? 1 : -1;
  }
  return 0;
};

type ExtendedColumnDef<T> = ColumnDef<T> & {
  width?: string | number;
  meta?: { fixed?: string; flex?: number };
  enableHiding?: boolean;
  initialVisible?: boolean;
}

interface DefaultTableProps<T> {
  data: T[];
  columns: ExtendedColumnDef<T>[];
  colorPalette?: ConditionalValue<
    | 'border'
    | 'bg'
    | 'current'
    | 'transparent'
    | 'black'
    | 'white'
    | 'whiteAlpha'
    | 'blackAlpha'
    | 'gray'
    | 'red'
    | 'orange'
    | 'yellow'
    | 'green'
    | 'teal'
    | 'blue'
    | 'cyan'
    | 'purple'
    | 'pink'
    | 'fg'
    | `var(--${string})`
  >;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  enableColumnVisibility?: boolean;
  pageSize?: number;
  title?: string | ReactNode;
  onRowClick?: (element: T) => void;
  loading?: boolean;
  addNewButton?: ReactNode;
  emptyStateComponent?: ReactNode;
}

export default function DefaultTable<T>({
  data,
  columns,
  colorPalette = 'gray',
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
  enableColumnVisibility = true,
  pageSize = 20,
  title,
  onRowClick,
  loading = false,
  addNewButton,
  emptyStateComponent,
}: DefaultTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    // Initialize column visibility from column definitions
    const initialVisibility: VisibilityState = {};
    columns.forEach((col) => {
      const extCol = col as ExtendedColumnDef<T>;
      if (extCol.initialVisible === false) {
        const colId = 'accessorKey' in col && typeof col.accessorKey === 'string' 
          ? col.accessorKey 
          : col.id || '';
        if (colId) {
          initialVisibility[colId] = false;
        }
      }
    });
    return initialVisibility;
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);

  const pageSizeCollection = createListCollection({
    items: [5, 10, 15, 20, 25],
    itemToString: (item) => item + '',
    itemToValue: (item) => item + '',
  });

  const normalizedColumns = useMemo(() => {
    return (columns as ExtendedColumnDef<T>[]).map((col) => {
      const copy = { ...col } as ExtendedColumnDef<T>;
      if (
        !('sortingFn' in copy) &&
        'accessorKey' in copy &&
        typeof copy.accessorKey === 'string'
      ) {
        copy.sortingFn = caseInsensitiveSort as any;
      }
      if (copy.width !== undefined) {
        if (typeof copy.width === 'string') {
          copy.meta = { ...(copy.meta ?? {}), fixed: copy.width };
        } else if (typeof copy.width === 'number') {
          copy.meta = { ...(copy.meta ?? {}), flex: copy.width };
        }
      } else {
        copy.meta = { ...(copy.meta ?? {}), flex: 1 };
      }
      return copy;
    });
  }, [columns]);

  // Calculate percentage widths for flex columns
  const colWidths = useMemo(() => {
    let totalFixedPx = 0;
    let totalFlex = 0;

    normalizedColumns.forEach((c) => {
      if (c.meta?.fixed && c.meta.fixed.endsWith("px")) {
        totalFixedPx += parseInt(c.meta.fixed, 10);
      } else if (c.meta?.flex) {
        totalFlex += c.meta.flex;
      }
    });

    return normalizedColumns.map((c) => {
      if (c.meta?.fixed) return c.meta.fixed;
      if (c.meta?.flex && totalFlex > 0) {
        return `calc(${(c.meta.flex / totalFlex) * 100}% - ${totalFixedPx / totalFlex}px)`;
      }
      return "auto";
    });
  }, [normalizedColumns]);

  const table = useReactTable({
    data,
    columns: normalizedColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      pagination: {
        pageIndex: page,
        pageSize: rowsPerPage,
      },
    },
    manualPagination: false,
    columnResizeMode: 'onChange',
  });

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
    table.setPageIndex(newPage);
  };

  const handleChangeRowsPerPage = (value: string) => {
    const newRowsPerPage = parseInt(value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    table.setPageSize(newRowsPerPage);
    table.setPageIndex(0);
  };

  const getSortIcon = (column: any) => {
    if (!enableSorting || !column.getCanSort()) return null;

    const sortDirection = column.getIsSorted();
    if (sortDirection === 'asc') return <TbArrowUp />;
    if (sortDirection === 'desc') return <TbArrowDown />;
    return <TbArrowsSort />;
  };

  const filteredData = table.getRowModel().rows;
  const totalRows = table.getFilteredRowModel().rows.length;
  const pageCount = Math.ceil(totalRows / rowsPerPage);
  const startRow = page * rowsPerPage + 1;
  const endRow = Math.min((page + 1) * rowsPerPage, totalRows);

  // Get visible columns count
  const visibleColumnsCount = table.getVisibleLeafColumns().length;

  return (
    <Box bg="white" shadow="md" rounded="lg" overflow="hidden" w="100%" colorScheme={colorPalette}>
      {(!!title || !!addNewButton || enableFiltering || enableColumnVisibility) && (
        <HStack p={[2, 2, 4]} borderBottomWidth={1} borderColor="gray.200" justify="space-between">
          {title ? typeof title === 'string' ? (
            <Text fontSize="lg" fontWeight="semibold">{title}</Text>
          ) : (title) : <Spacer />}
          <HStack>
            {enableFiltering && (
              <HStack>
                <Text hideBelow={'sm'} fontSize="sm" color="gray.600" textWrap={"nowrap"}>Cerca fra le colonne...</Text>
                <Input placeholder='cerca...' value={globalFilter ?? ''} onChange={(e) => setGlobalFilter(e.target.value)} size="sm" aria-label="Search all columns" />
              </HStack>
            )}
            {enableColumnVisibility && (
              <Menu.Root>
                <Menu.Trigger asChild>
                  <IconButton aria-label="Toggle columns" size="sm" variant="outline">
                    <TbColumns />
                  </IconButton>
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content>
                      {table.getAllLeafColumns().map((column) => {
                        const columnDef = column.columnDef as ExtendedColumnDef<T>;
                        
                        // Skip columns where enableHiding is explicitly set to false
                        if (columnDef.enableHiding === false) return null;
                        
                        const header = columnDef.header;
                        const headerText = typeof header === 'string' 
                          ? header 
                          : typeof header === 'function'
                          ? 'Column'
                          : column.id;
                        
                        return (
                          <Menu.Item
                            key={column.id}
                            value={column.id}
                            closeOnSelect={false}
                            onClick={(e) => {
                              e.preventDefault();
                              column.toggleVisibility(!column.getIsVisible());
                            }}
                          >
                            <Checkbox.Root
                              checked={column.getIsVisible()}
                              onCheckedChange={() => column.toggleVisibility(!column.getIsVisible())}
                            >
                              <Checkbox.HiddenInput />
                              <Checkbox.Control />
                              <Checkbox.Label>{headerText}</Checkbox.Label>
                            </Checkbox.Root>
                          </Menu.Item>
                        );
                      })}
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
            )}
            {addNewButton}
          </HStack>
        </HStack>
      )}

      <Box overflowX="auto">
        <Table.Root size="sm">
          {/* ColGroup ensures consistent widths */}
          <Table.ColumnGroup>
            {table.getVisibleLeafColumns().map((column) => {
              const colIndex = table.getAllLeafColumns().findIndex(c => c.id === column.id);
              return <Table.Column key={column.id} style={{ width: colWidths[colIndex] }} />;
            })}
          </Table.ColumnGroup>

          <Table.Header bg={`${colorPalette}.50`}>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Table.ColumnHeader
                    key={header.id}
                    cursor={enableSorting && header.column.getCanSort() ? 'pointer' : 'default'}
                    userSelect="none"
                    onClick={header.column.getToggleSortingHandler()}
                    _hover={enableSorting && header.column.getCanSort() ? { bg: `${colorPalette}.100` } : undefined}
                  >
                    <HStack gap={1}>
                      <Text>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</Text>
                      {getSortIcon(header.column)}
                    </HStack>
                  </Table.ColumnHeader>
                ))}
              </Table.Row>
            ))}
          </Table.Header>

          <Table.Body>
            {loading ? (
              <Table.Row>
                <Table.Cell colSpan={visibleColumnsCount} textAlign="center" py={8}>
                  <Center><Spinner size="lg" /></Center>
                </Table.Cell>
              </Table.Row>
            ) : (
              filteredData.map((row, index) => (
                <Table.Row key={row.id} _hover={{ bg: `${colorPalette}.50` }} bg={index % 2 === 1 ? `${colorPalette}.25` : 'white'} cursor={onRowClick ? 'pointer' : 'default'} onClick={() => onRowClick ? onRowClick(row.original) : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <Table.Cell key={cell.id} px={4} py={2} lineHeight="short">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))
            )}
            {filteredData.length === 0 && !loading && (
              <Table.Row>
                <Table.Cell colSpan={visibleColumnsCount} textAlign="center" py={[4, 4, 8]}>
                  {emptyStateComponent || (<Text color={`${colorPalette}.500`} fontSize="sm">No data available</Text>)}
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </Box>

      {enablePagination && totalRows > 0 && (
        <SimpleGrid columns={12} w='full' p={[2, 2, 4]} borderTopWidth={1} borderColor="gray.200">
          <GridItem colSpan={[12, 3]}>
            <HStack>
              <Text fontSize="sm" color="gray.600">Rows per page:</Text>
              <Select.Root 
                collection={pageSizeCollection} 
                size="xs" 
                w='50px'
                positioning={{ sameWidth: true }} 
                lazyMount required 
                value={[rowsPerPage + '']} 
                onValueChange={({ value }) => handleChangeRowsPerPage(value[0])}
              >
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="Rows per page..." />
                  </Select.Trigger>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {pageSizeCollection.items.map((item) => (
                        <Select.Item item={item} key={item}>
                          {item}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </HStack>
          </GridItem>
          <GridItem colSpan={[12, 1]} />

          <GridItem colSpan={[12, 8]}>
            <HStack justify='end'>
              <Text fontSize="sm" color="gray.600">{totalRows === 0 ? '0-0 of 0' : `${startRow}-${endRow} of ${totalRows}`}</Text>
            
              <HStack gap={1} justify='center'>
                <IconButton aria-label="First page" size="sm" variant="ghost" onClick={() => handleChangePage(0)} disabled={page === 0}><TbChevronsLeft /></IconButton>
                <IconButton aria-label="Previous page" size="sm" variant="ghost" onClick={() => handleChangePage(page - 1)} disabled={page === 0}><TbChevronLeft /></IconButton>
                {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
                  let pageNum;
                  if (pageCount <= 5) pageNum = i;
                  else if (page < 3) pageNum = i;
                  else if (page > pageCount - 3) pageNum = pageCount - 5 + i;
                  else pageNum = page - 2 + i;
                  return (
                    <Button key={pageNum} size="xs" variant={page === pageNum ? 'solid' : 'ghost'} colorScheme={page === pageNum ? 'blue' : undefined} colorPalette={colorPalette} onClick={() => handleChangePage(pageNum)}>
                      {pageNum + 1}
                    </Button>
                  );
                })}
                <IconButton aria-label="Next page" size="sm" variant="ghost" onClick={() => handleChangePage(page + 1)} disabled={page >= pageCount - 1}><TbChevronRight /></IconButton>
                <IconButton aria-label="Last page" size="sm" variant="ghost" onClick={() => handleChangePage(pageCount - 1)} disabled={page >= pageCount - 1}><TbChevronsRight /></IconButton>
              </HStack>
            </HStack>
          </GridItem>
        </SimpleGrid>
      )}
    </Box>
  );
}
