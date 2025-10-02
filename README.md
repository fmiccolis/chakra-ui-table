# Chakra UI Table

A feature-rich, customizable table component for React applications built with TanStack Table v8, Chakra UI v3, and TypeScript.

## Features

- 🔍 **Global Search** - Filter across all columns simultaneously
- 🔄 **Sorting** - Case-insensitive sorting with visual indicators
- 📄 **Pagination** - Customizable page sizes with intuitive navigation
- 👁️ **Column Visibility** - Show/hide columns dynamically
- 📱 **Responsive Design** - Mobile-friendly layout with adaptive UI
- 🎨 **Themeable** - Supports Chakra UI color palettes
- ⚡ **Performance** - Optimized rendering with useMemo
- 🎯 **Row Actions** - Built-in row click handlers
- 🔧 **Flexible Column Widths** - Support for fixed and flex-based column sizing
- 💫 **Loading States** - Built-in loading spinner support
- 🎭 **Empty States** - Customizable empty state components

## Installation

```bash
npm install @tanstack/react-table @chakra-ui/react react-icons
```
Then copy the file into your `path/to/components/ui`

## Dependencies

- React 18+
- @tanstack/react-table v8
- @chakra-ui/react v3
- react-icons

## Usage

### Basic Example

```tsx
import DefaultTable from './default-table';
import { type ColumnDef } from '@tanstack/react-table';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
];

const data: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
];

function App() {
  return (
    <DefaultTable
      data={data}
      columns={columns}
      title="Users"
    />
  );
}
```

### Advanced Example with Custom Column Widths

```tsx
const columns: ExtendedColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    width: '80px', // Fixed width
    enableHiding: false, // Cannot be hidden
  },
  {
    accessorKey: 'name',
    header: 'Name',
    width: 2, // Flex value (takes 2x space)
  },
  {
    accessorKey: 'email',
    header: 'Email',
    width: 3, // Flex value (takes 3x space)
  },
  {
    accessorKey: 'role',
    header: 'Role',
    width: 1, // Flex value (takes 1x space)
    initialVisible: false, // Hidden by default
  },
];

<DefaultTable
  data={data}
  columns={columns}
  title="Users Management"
  colorPalette="blue"
  pageSize={10}
  onRowClick={(user) => console.log('Clicked:', user)}
  addNewButton={<Button>Add User</Button>}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | **required** | Array of data objects to display |
| `columns` | `ExtendedColumnDef<T>[]` | **required** | Column definitions |
| `colorPalette` | `string` | `'gray'` | Chakra UI color palette |
| `enableSorting` | `boolean` | `true` | Enable column sorting |
| `enableFiltering` | `boolean` | `true` | Enable global search filter |
| `enablePagination` | `boolean` | `true` | Enable pagination |
| `enableColumnVisibility` | `boolean` | `true` | Enable column visibility toggle |
| `pageSize` | `number` | `20` | Initial rows per page |
| `title` | `string \| ReactNode` | `undefined` | Table title |
| `onRowClick` | `(row: T) => void` | `undefined` | Row click handler |
| `loading` | `boolean` | `false` | Show loading spinner |
| `addNewButton` | `ReactNode` | `undefined` | Custom button in header |
| `emptyStateComponent` | `ReactNode` | `undefined` | Custom empty state |

## Extended Column Definition

The component extends TanStack Table's `ColumnDef` with additional properties:

```typescript
interface ExtendedColumnDef<T> extends ColumnDef<T> {
  width?: string | number;          // '100px' for fixed, number for flex
  enableHiding?: boolean;           // Allow column to be hidden
  initialVisible?: boolean;         // Initial visibility state
}
```

## Column Width Options

- **Fixed Width**: Use string with units (e.g., `'100px'`, `'20%'`)
- **Flex Width**: Use numbers for relative sizing (e.g., `1`, `2`, `3`)
- **Auto Width**: Omit `width` property for equal distribution

## Features in Detail

### Sorting

- Click column headers to sort
- Case-insensitive string sorting
- Visual indicators (arrows) for sort direction
- Support for custom sorting functions

### Filtering

- Global search across all columns
- Real-time filtering as you type
- Searches through all visible column data

### Pagination

- Customizable page sizes (5, 10, 15, 20, 25)
- First/Previous/Next/Last navigation
- Smart page number display (shows 5 pages at a time)
- Row count display

### Column Visibility

- Toggle columns on/off via dropdown menu
- Persist visibility state during session
- Set default visibility with `initialVisible`
- Prevent hiding with `enableHiding: false`

### Responsive Design

- Mobile-friendly layout
- Horizontal scroll for overflow
- Adaptive pagination controls
- Responsive header spacing

## Styling

The component uses Chakra UI's styling system and supports:

- Color palettes: `gray`, `blue`, `red`, `green`, `purple`, etc.
- Alternating row colors
- Hover effects
- Shadow and border radius
- Responsive padding

## TypeScript Support

Fully typed with TypeScript generics for type-safe table data and columns.

## Browser Support

Supports all modern browsers that are compatible with React 18 and Chakra UI v3.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Built with [TanStack Table](https://tanstack.com/table)
- Styled with [Chakra UI](https://chakra-ui.com)
- Icons from [Tabler Icons](https://tabler-icons.io)
