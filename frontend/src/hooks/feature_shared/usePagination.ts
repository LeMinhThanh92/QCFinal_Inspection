import {useState} from "react";

export const usePagination = () => {
    const [paginationModel, setPaginationModel] = useState({
        pageSize: 100,
        page: 0,
    });

    return {paginationModel, setPaginationModel};
};