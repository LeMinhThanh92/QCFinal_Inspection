import {
    DataGrid,
    GridRowClassNameParams,
    GridToolbarProps,
    GridValidRowModel,
    ToolbarPropsOverrides
} from "@mui/x-data-grid";
import { Box, styled } from "@mui/material";
import { PaginationCustom } from "./PaginationCustom.tsx";
import { DataGridProps } from "@mui/x-data-grid/models/props/DataGridProps";
import { CustomNoRowsOverlay } from "@components/DataGrid/CustomNoRowsOverlay.tsx";

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
    "&.MuiDataGrid-root .MuiDataGrid-virtualScroller": {
        paddingLeft: 0,
        paddingRight: 0,
    },
    '& .MuiDataGrid-row': {
        '&:hover': {
            backgroundColor: theme.color.background.o10,
        },
        '&:hover .fixed-column': {
            backgroundColor: theme.color.background.o10,
        },
        "& .fixed-column.active": {
            boxShadow: "6px 0px 6px -3px rgba(214, 214, 214, 1)",
        },
        "& .fixed-column-header.active": {
            boxShadow: "6px 0px 6px -3px rgba(214, 214, 214, 1)",
        },
        '&.row-highlight': {
            backgroundColor: `${theme.color.primary.o1} !important`,
            '&:hover': {
                backgroundColor: `${theme.color.primary.o2} !important`,
            },
            '& .MuiDataGrid-cell': {
                borderTop: 'none !important',
                borderBottom: 'none !important',
                color: `${theme.color.primary.o6} !important`,
                fontWeight: 600,
            }
        },
        backgroundColor: theme.color.background.o1,
        color: theme.color.text.o1,
        border: 0,
        marginTop: 5,
        cursor: 'pointer'
    },
    '& .MuiDataGrid-columnHeader ': {
        backgroundColor: theme.color.background.o2,
        color: theme.color.text.o1,
    },
    '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
        outline: 'none !important',
    },
    '& .MuiDataGrid-columnHeaderTitle': {
        fontWeight: 700,
    },
    '& .MuiDataGrid-columnSeparator': {
        visibility: 'hidden',
    },
    '&, [class^=MuiDataGrid]': {
        borderColor: theme.color.background.o2,
        boxShadow: 20,
    },
    '& .MuiTablePagination-displayedRows': {
        display: 'none',
    },
    '&.MuiDataGrid-root': {
        position: 'static !important',
    },
    '& .MuiToolbar-root.MuiToolbar-gutters.MuiToolbar-regular.MuiTablePagination-toolbar': {
        display: 'flex',
        justifyContent: 'center',
        position: 'absolute',
        right: 30,
        marginTop: 8,
        paddingLeft: 0,
    },
    '& .MuiPagination-root.MuiPagination-text.MuiTablePagination-actions.css-1oj2twp-MuiPagination-root': {
        marginLeft: 0,
    },
    '& .MuiDataGrid-cell:focus': {
        outline: 'none',
    },
    '& .MuiDataGrid-cell:focus-within': {
        outline: 'none',
    },
    '& .MuiDataGrid-topContainer, & .MuiDataGrid-container--top::after': {
        backgroundColor: 'transparent'
    },
    '& .cell-highlight': {
        backgroundColor: `${theme.color.primary.o1} !important`,
        fontWeight: 600,
        color: 'red',
        borderTop: 'none !important',
        borderBottom: 'none !important',
    },
    '& .MuiDataGrid-cell--editable': {
        cursor: 'text',
        '&:hover': {
            backgroundColor: theme.color.background.o10,
        }
    }
}));

interface DataGridViewProps extends DataGridProps {
    getRowClassName?: ((params: GridRowClassNameParams<GridValidRowModel>) => string) | undefined
    toolbarCustom?: React.JSXElementConstructor<GridToolbarProps & ToolbarPropsOverrides> | null | undefined
    height?: any;
    title?: any;
    highlightRow?: (row: any) => boolean;
    highlightCell?: (row: any, field: string) => boolean;
    editable?: boolean;
}

export function DataGridView(props: DataGridViewProps) {
    const { highlightRow, highlightCell, editable = false, ...otherProps } = props;

    const getDefaultRowClassName = (params: GridRowClassNameParams) => {
        if (highlightRow && highlightRow(params.row)) {
            return 'row-highlight';
        }
        return 'active';
    };

    const getCellClassName = (params: any) => {
        if (highlightCell && highlightCell(params.row, params.field)) {
            return 'cell-highlight';
        }
        return '';
    };

    return (
        <Box sx={{
            height: props.height ? props.height : '75vh',
            scrollbarWidth: 'none',
            '& .MuiDataGrid-filler': {
                display: 'none'
            }
        }}>
            <StyledDataGrid
                {...otherProps}
                rowHeight={55}
                getRowId={props.getRowId}
                rows={props.rows}
                columns={props.columns}
                slots={{
                    pagination: PaginationCustom,
                    toolbar: props.toolbarCustom,
                    noRowsOverlay: () => <CustomNoRowsOverlay title={props.title} />,
                }}
                getRowClassName={props.getRowClassName ?? getDefaultRowClassName}
                getCellClassName={getCellClassName}
                pageSizeOptions={[100]}
                hideFooterSelectedRowCount
                disableVirtualization
                disableColumnSelector
                disableColumnResize={false}
                disableDensitySelector
                isRowSelectable={() => false}
                onRowClick={props.onRowClick}
                editMode={editable ? "row" : undefined}
                processRowUpdate={props.processRowUpdate}
                onProcessRowUpdateError={props.onProcessRowUpdateError}
            />
        </Box>
    );
}