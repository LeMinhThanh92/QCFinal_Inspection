import { styled, TablePaginationProps } from "@mui/material";
import { gridPageCountSelector, GridPagination, useGridApiContext, useGridSelector } from "@mui/x-data-grid";
import MuiPagination from "@mui/material/Pagination";
import React from "react";

function Pagination(
    {
        page,
        onPageChange,
        className,
    }: Pick<TablePaginationProps, 'page' | 'onPageChange' | 'className'>) {
    const apiRef = useGridApiContext();
    const pageCount = useGridSelector(apiRef, gridPageCountSelector);

    return (
        <MuiPagination
            sx={{
                mt: -8,
                mr: -4,
                '& .MuiPaginationItem-root': {
                    color: 'inherit',
                },
            }}
            color={'secondary'}
            className={className}
            count={pageCount}
            page={page + 1}
            shape={'rounded'}
            onChange={(event: React.ChangeEvent<unknown>, newPage: number) => {
                onPageChange(event as any, newPage - 1);
            }}
        />
    );
}

const StyledWrapper = styled('div')(({ theme }) => ({
    display: "flex",
    width: "100%",
    justifyContent: 'end',
    position: 'sticky',
    zIndex: 10,
    right: 0,
    "& .MuiPaginationItem-root": {
        color: theme.color.text.o1,
    },
}));

export function PaginationCustom(props: any) {
    return (
        <StyledWrapper>
            <GridPagination ActionsComponent={Pagination} {...props} />
        </StyledWrapper>
    );
}