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
import { BorderTop } from "@mui/icons-material";
import { LazyLoadPaginationCustom } from "./LazyLoadPaginationCustom.tsx";

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
    "&.MuiDataGrid-root .MuiDataGrid-virtualScroller": {
        paddingLeft: 0,
        paddingRight: 0,
    },
    '& .MuiDataGrid-row': {
        // '&.active': {
        //     backgroundColor: 'white',
        // },
        // '&.inactive': {
        //     backgroundColor: '#F6F6FA',
        //     boxShadow: '0px 0px 20px 0px #5A5A5A1A',
        // },
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
        backgroundColor: theme.color.background.o1,
        color: theme.color.text.o1,
        border: 0,
        marginTop: 6,
        fontSize: 16,
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
}));

interface LazyLoadDataGridProps extends DataGridProps {
    getRowClassName?: ((params: GridRowClassNameParams<GridValidRowModel>) => string) | undefined
    toolbarCustom?: React.JSXElementConstructor<GridToolbarProps & ToolbarPropsOverrides> | null | undefined
    height?: any;
    title?: any;
    totalCurrentRow: number;
}

export function LazyLoadDataGrid(props: LazyLoadDataGridProps) {
    const getDefaultRowClassName = () => 'active'

    return (
        <Box sx={{
            height: props.height ? props.height : '85vh', scrollbarWidth: 'none',
            '& .MuiDataGrid-filler': {
                display: 'none'
            }
        }}>
            <StyledDataGrid
                {...props}
                rowHeight={65}
                getRowId={props.getRowId}
                rows={props.rows}
                columns={props.columns}
                slots={{
                    pagination: () => <LazyLoadPaginationCustom rowCount={props.rowCount} totalCurrentRow={props.totalCurrentRow} />,
                    toolbar: props.toolbarCustom,
                    noRowsOverlay: () => <CustomNoRowsOverlay title={props.title} />,
                }}
                getRowClassName={props.getRowClassName ?? getDefaultRowClassName}
                pageSizeOptions={[10]}
                hideFooterSelectedRowCount
                disableVirtualization
                // disableColumnFilter
                // disableColumnSorting
                // disableColumnMenu
                disableColumnSelector
                disableColumnResize={false}
                disableDensitySelector
                isRowSelectable={() => false}
            />
        </Box>
    );
}


