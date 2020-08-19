import * as React from 'react';
import { useTable, useRowSelect, UseRowSelectRowProps, Row } from 'react-table';
import { useMemo } from 'react';
import Store from '../undux/Store';
import { DirectoryTreeRow } from '../model/DirectoryTreeRow';
import styled from 'styled-components';
import OpenDirectory from './OpenDirectory';
import { getSubdirectories } from '../util/directory/DirectoryUtils';

const RowHover = styled.td`
  background: black;
  opacity: 0.5;
  position: absolute;
  width: 100%;
`;

const Cell = styled.td`
  position: relative;
  cursor: pointer;
  user-select: none;
`;

const Table: React.FC = () => {
  const store = Store.useStore();
  const [hoveredRow, setHoveredRow] = React.useState<number>();

  const directoryList = store.get('directoryList');

  const data = useMemo(
    () =>
      directoryList.map((directory) => ({
        name: directory.name,
        isLink: <OpenDirectory directory={directory} />,
        linkedPath: directory.linkedPath,
      })),
    [directoryList]
  );

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

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, selectedFlatRows } = useTable(
    {
      columns,
      data,
    },
    useRowSelect
  ) as any;

  React.useEffect(() => {
    store.set('selectedRows')(selectedFlatRows);
  }, [selectedFlatRows]);

  const selectRow = (row: UseRowSelectRowProps<DirectoryTreeRow>) => {
    row.toggleRowSelected();
  };

  const onRowHover = (row: Row) => {
    setHoveredRow(row.index);
  };

  const onTableLeave = (row) => {
    setHoveredRow(undefined);
  };

  const navigateToParent = () => {
    const split = store.get('currentDirectory').split('\\');
    split.pop();
    const path = `${split.join('\\')}\\`;
    const subdirs = getSubdirectories(path);
    store.set('directoryList')(subdirs);
    store.set('currentDirectory')(path);
  };

  const renderNavigateToParent = () => {
    const split = store.get('currentDirectory').split('\\');
    const noParent = split.length < 2 || (split.length === 2 && split[1].trim() === '');

    if (!noParent)
      return (
        <tr>
          <Cell></Cell>
          <Cell onClick={navigateToParent}>^^^^</Cell>
          <Cell></Cell>
        </tr>
      );

    return null;
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
        {renderNavigateToParent()}
        {rows.map((row: Row & UseRowSelectRowProps<DirectoryTreeRow>) => {
          prepareRow(row);
          return (
            <tr
              style={{
                color: row.isSelected ? 'red' : 'black',
              }}
              onClick={() => selectRow(row)}
              {...row.getRowProps()}
            >
              {row.cells.map((cell: Record<string, any>, index: number) => {
                return <Cell {...cell.getCellProps()}>{cell.render('Cell')}</Cell>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default Table;
