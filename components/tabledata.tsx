"use client";
import {
    Button,
    Card,
    CardBody,
    Input,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Dropdown,
    DropdownMenu,
    DropdownTrigger,
    DropdownItem
} from "@heroui/react";
import React, { useState, useMemo } from "react";
import { LuChevronDown, LuSearch } from "react-icons/lu";

interface Column {
    key: string;
    label: string;
    renderCell?: (row: any) => React.ReactNode;
}

interface DataTableProps {
    columns: Column[];
    data: any[];
    label: string;
    description: string;
    filter: boolean;
    statusOptions?: { key: string; label: string }[];
}

const TableData = ({ columns, data, label, description, statusOptions = [], filter }: DataTableProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [visibleColumns, setVisibleColumns] = useState(columns.map(col => col.key));
    const [roleFilter, setRoleFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");

    const handleColumnFilterChange = (selectedKeys: any) => {
        setVisibleColumns(Array.from(selectedKeys));
    };

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const matchesSearch = columns.some((column) => {
                if (visibleColumns.includes(column.key)) {
                    const value = item[column.key];
                    if (column.key === 'user') {
                        return value?.name?.toLowerCase().includes(searchTerm.toLowerCase());
                    }
                    return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
                }
                return false;
            });

            const matchesRole = roleFilter === "all" || (item.role && item.role.toLowerCase() === roleFilter.toLowerCase());
            const matchesType = typeFilter === "all" || (item.type && item.type.toLowerCase() === typeFilter.toLowerCase());

            return matchesSearch && matchesRole && matchesType;
        });
    }, [searchTerm, data, visibleColumns, columns, roleFilter, typeFilter]);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    return (
        <Card className="shadow-sm border-2 border-gray-100">
            <CardBody>
                <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4 w-full">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-semibold text-violet-800">{label}</h1>
                        <p className="text-gray-500 text-sm">{description || ""}</p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="w-full sm:w-auto">
                      
                           <Input
                           startContent={<LuSearch size={18} />}
                           size="lg"
                           type="search"
                           placeholder="Search..."
                           value={searchTerm}
                           onChange={(e) => {
                               setSearchTerm(e.target.value);
                               setCurrentPage(1); // 👈 Reset to page 1 on search
                           }}
                           className="w-full"
                       />
                       
                        </div>

                        {filter === false ? null : (
                            <div className="flex items-center gap-2">
                                <Dropdown>
                                    <DropdownTrigger>
                                        <Button color="primary" endContent={<LuChevronDown />} size="lg" variant="flat">
                                            Show Columns
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        aria-label="Table Columns"
                                        closeOnSelect={false}
                                        selectionMode="multiple"
                                        selectedKeys={new Set(visibleColumns)}
                                        onSelectionChange={handleColumnFilterChange}
                                    >
                                        {columns.map((column) => (
                                            <DropdownItem key={column.key}>{column.label}</DropdownItem>
                                        ))}
                                    </DropdownMenu>
                                </Dropdown>
                            </div>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto rounded-lg">
                    <Table>
                        <TableHeader>
                            {columns.filter(col => visibleColumns.includes(col.key)).map((column) => (
                                <TableColumn key={column.key}>{column.label}</TableColumn>
                            ))}
                        </TableHeader>
                        <TableBody emptyContent={"No data found"}>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((item, index) => (
                                    <TableRow key={index}>
                                        {columns.filter(col => visibleColumns.includes(col.key)).map((column) => (
                                            <TableCell key={column.key}>
                                                {column.renderCell ? column.renderCell(item) : item[column.key]}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : []}
                        </TableBody>
                    </Table>
                </div>

                <div className="py-2 px-2 flex flex-col sm:flex-row justify-between items-center gap-2">
                    <span className="text-sm text-gray-500">
                        Showing {paginatedData.length} of {filteredData.length} items
                    </span>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Rows per page:</span>
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button variant="flat" size="sm" className="capitalize">
                                        {rowsPerPage}
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label="Rows per page"
                                    selectionMode="single"
                                    selectedKeys={new Set([rowsPerPage.toString()])}
                                    onSelectionChange={(selected) => {
                                        const selectedValue = parseInt(Array.from(selected)[0] as string);
                                        setRowsPerPage(selectedValue);
                                        setCurrentPage(1);
                                    }}
                                >
                                    {[5, 10, 15].map((num) => (
                                        <DropdownItem key={num.toString()}>{num}</DropdownItem>
                                    ))}
                                </DropdownMenu>
                            </Dropdown>
                        </div>

                        <Pagination
                            isCompact
                            showControls
                            color="primary"
                            page={currentPage}
                            total={totalPages}
                            onChange={setCurrentPage}
                        />
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

export default TableData;
