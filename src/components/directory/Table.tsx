import * as React from 'react';
import {
  useTable,
  useRowSelect,
  UseRowSelectRowProps,
  TableRow as TableRowType,
  useSortBy,
  TableOptions,
  UseSortByOptions,
} from 'react-table';
import { useMemo } from 'react';
import { DirectoryTreeRow } from '../../model/DirectoryTreeRow';
import styled from 'styled-components';
import OpenDirectory from './OpenDirectory';
import { getSubdirectories, readFolderSize } from '../../util/directory/DirectoryUtils';
import { selectedRowsState, directoryListState, currentDirectoryState } from '../../recoil/Recoil';
import { useRecoilState, useSetRecoilState } from 'recoil';
import DirectorySize from './DirectorySize';
import produce from 'immer';

const RowHover = styled.td`
  background: black;
  opacity: 0.5;
  position: absolute;
  width: 100%;
`;

const StyledHeader = styled.th`
  padding: 12px;
  user-select: none;
`;

const Cell = styled.td`
  padding: 6px 14px;
  position: relative;
  cursor: pointer;
  user-select: none;

  &:first-child {
    padding-left: 12px;
  }

  &:last-child {
    padding-right: 12px;
  }
`;

const StyledTable = styled.table`
  color: #ddd;
  font-size: 16px;
  border-collapse: collapse;
`;

const TableRow = styled.tr<{ selected: boolean }>`
  color: ${(props) => (props.selected ? '#fff' : '#eee')};
  background: ${(props) => (props.selected ? 'rgba(0, 0, 0, 0.5)' : 'transparent')};
  height: 24px;
  padding: 0 12px;
  margin: 2px 0;
  transition: all 0.1s ease-in-out;

  .open-directory {
    opacity: 0;
  }

  &:hover {
    color: #fff;
    .open-directory {
      opacity: 1;
    }
  }
`;

const Table: React.FC = () => {
  const setSelectedRows = useSetRecoilState(selectedRowsState);
  const [directoryList, setDirectoryList] = useRecoilState<any>(directoryListState);
  const [currentDirectory, setCurrentDirectory] = useRecoilState<string>(currentDirectoryState);
  const [fileSizes, setFileSizes] = React.useState<number[]>([]);

  React.useEffect(() => {
    const getDirectorySize = (path: string, index: number) => {
      readFolderSize(path, (_err: any, size: number) => {
        setFileSizes((prevFileSize) =>
          produce(prevFileSize, (draftFileSize) => {
            draftFileSize[index] = size;
          })
        );
      });
    };

    setFileSizes([]);

    directoryList.map((directory: DirectoryTreeRow, index: number) => {
      getDirectorySize(directory.path, index);
    });
  }, [directoryList]);

  const data = useMemo(
    () =>
      directoryList.map((directory: DirectoryTreeRow, index: number) => {
        return {
          name: directory.name,
          goTo: <OpenDirectory directory={directory} />,
          linkedPath: directory.linkedPath,
          path: directory.path,
          rawSize: fileSizes[index] || null,
          size: <DirectorySize size={fileSizes[index]} />,
        };
      }),
    [directoryList, fileSizes]
  );

  const columns = useMemo(
    () => [
      {
        Header: 'Directory',
        accessor: 'name',
      },
      {
        Header: '',
        accessor: 'goTo',
      },
      {
        Header: 'Link Path',
        accessor: 'linkedPath',
      },
      {
        Header: 'Size',
        accessor: 'size',
        sortType: (rowA: any, rowB: any, _colId: string, desc: boolean) => {
          const aSize = rowA.original.rawSize || 0;
          const bSize = rowB.original.rawSize || 0;
          return aSize > bSize ? 1 : -1;
          // if (desc) {

          // } else {
          //   return aSize < bSize;
          // }
        },
      },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, selectedFlatRows } = useTable<any>(
    {
      columns,
      data,
      autoResetSortBy: false,
    },
    useSortBy,
    useRowSelect
  ) as any;

  React.useEffect(() => {
    const selectedRows = selectedFlatRows.map(
      (row: TableRowType<DirectoryTreeRow> & UseRowSelectRowProps<DirectoryTreeRow>) => ({
        id: row.id,
        index: row.index,
        isSelected: row.isSelected,
        original: row.original,
        values: row.values,
      })
    );
    setSelectedRows(selectedRows);
  }, [selectedFlatRows]);

  const selectRow = (row: UseRowSelectRowProps<DirectoryTreeRow>) => row.toggleRowSelected();

  const navigateToParent = () => {
    // Remove trailing slash
    let workingDirectory = currentDirectory.trim();
    if (workingDirectory.endsWith('\\')) {
      workingDirectory = workingDirectory.slice(0, -1);
    }
    const split = workingDirectory.split('\\');
    split.pop();
    const path = `${split.join('\\')}\\`;
    const subdirs = getSubdirectories(path);
    setDirectoryList(subdirs);
    setCurrentDirectory(path);
  };

  const renderNavigateToParent = () => {
    const split = currentDirectory.split('\\');
    const noParent = split.length < 2 || (split.length === 2 && split[1].trim() === '');

    if (!noParent)
      return (
        <tr>
          <Cell onClick={navigateToParent}>...</Cell>
          <Cell></Cell>
          <Cell></Cell>
        </tr>
      );

    return null;
  };

  return (
    <StyledTable {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup: Record<string, any>) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column: Record<string, any>) => (
              <StyledHeader {...column.getHeaderProps(column.getSortByToggleProps())}>
                {column.render('Header')}
              </StyledHeader>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {renderNavigateToParent()}
        {rows.map((row: any & UseRowSelectRowProps<DirectoryTreeRow>) => {
          prepareRow(row);
          return (
            <TableRow selected={row.isSelected} onClick={() => selectRow(row)} {...row.getRowProps()}>
              {row.cells.map((cell: Record<string, any>, index: number) => {
                return <Cell {...cell.getCellProps()}>{cell.render('Cell')}</Cell>;
              })}
            </TableRow>
          );
        })}
      </tbody>
    </StyledTable>
  );
};

export default Table;
