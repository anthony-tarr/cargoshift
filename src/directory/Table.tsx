import * as React from 'react';
import { useTable, useRowSelect, UseRowSelectRowProps, Row } from 'react-table';
import { useMemo } from 'react';
import Store from '../undux/Store';
import { DirectoryTreeRow } from '../model/DirectoryTreeRow';

const Table: React.FC = () => {
  const store = Store.useStore();
  const columns = useMemo(
    () => [
      {
        Header: 'Directory',
        accessor: 'name',
      },
      {
        Header: '',
        accessor: 'isLink',
      },
      {
        Header: 'Symlink Path',
        accessor: 'linkedPath',
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    selectedFlatRows,
    state: { selectedRowIds },
  } = useTable<any>(
    {
      columns,
      data: store.get('directoryList'),
    },
    useRowSelect
  ) as any;

  const selectRow = (e: React.SyntheticEvent, row: UseRowSelectRowProps<DirectoryTreeRow>) => {
    row.toggleRowSelected();
    console.log(selectedFlatRows);
    store.set('selectedRows')(selectedFlatRows);
  };

  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup: Record<string, any>) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column: Record<string, any>) => (
              <th {...column.getHeaderProps()}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row: Row & UseRowSelectRowProps<DirectoryTreeRow>) => {
          prepareRow(row);
          return (
            <tr
              style={{
                color: row.isSelected ? 'red' : 'black',
              }}
              onClick={(e) => selectRow(e, row)}
              {...row.getRowProps()}
            >
              {row.cells.map((cell: Record<string, any>) => {
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default Table;
