'use client';

import useSWR from 'swr';
import { useEffect, useState, useMemo } from 'react';
import { DataTable } from '@/components/data-table';
import { Column } from '@/app/utils/types';
import type { Inquiry } from '@/app/utils/types';
import LoadingDot from '@/components/loading-dot';
import EditModal from './edit-inquiry-modal';
import { BreadcrumbItem, Breadcrumbs, Button, Card, CardBody, Link } from "@heroui/react";
import DeleteModal from './delete-inquiry-modal';
import fetchWithToken from '@/app/utils/fetch-with-token';
import TableData from '@/components/tabledata';

export default function Property() {
    const { data, error, mutate } = useSWR<{ code: number; message: string; name: string; user: string; records: Inquiry[] }>(
        'https://abicmanpowerservicecorp.com/api/inquiries',
        fetchWithToken
    );

    // Search term state
    const [searchTerm, setSearchTerm] = useState('');

    const columns = [
        {
            key: 'user',
            label: 'Agent',
            renderCell: (row: any) => (
                <div className="truncate">
                    <span>{row.user?.name || 'N/A'}</span>
                </div>
            ),
        },
        {
            key: 'first_name',
            label: 'Full Name',
            renderCell: (row: any) => (
                <div className="truncate">
                    <span>
                        {row.first_name} {row.last_name}
                    </span>
                </div>
            ),
        },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'type', label: 'Type' },
        { key: 'message', label: 'Message' },
        { key: 'status', label: 'Status' },
        {
            key: 'id',
            label: 'Action',
            renderCell: (row: any) => (
                <div className="flex gap-2">
                    <Button
                        className='bg-violet-500 text-white'
                        onClick={() => handleAction(row)}
                        size="sm"
                    >
                        Reply
                    </Button>
                    <Button
                        className='bg-red-500 text-white'
                        onClick={() => handleDelete(row)}
                        size="sm"
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

    useEffect(() => {
        if (data && data.records) {
            setInquiries(data.records);
        }
    }, [data]);

    // Filtering data based on search term
    const filteredData = useMemo(() => {
        return inquiries.filter((item) =>
            Object.entries(item).some(([key, value]) => {
                if (value == null) return false;
                if (key === 'user' && typeof value === 'object' && value.name) {
                    return value.name.toLowerCase().includes(searchTerm.toLowerCase());
                }
                if (typeof value === 'object') {
                    return Object.values(value).some(
                        (nestedValue) =>
                            nestedValue &&
                            nestedValue.toString().toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }
                return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
            })
        );
    }, [inquiries, searchTerm]);
    

    const handleAction = (inquiry: Inquiry) => {
        setSelectedInquiry(inquiry);
        setEditModalOpen(true);
    };

    const handleDelete = (inquiry: Inquiry) => {
        setSelectedInquiry(inquiry);
        setDeleteModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setEditModalOpen(false);
        setSelectedInquiry(null);
    };

    const handleCloseDeleteModal = () => {
        setDeleteModalOpen(false);
        setSelectedInquiry(null);
    };

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    if (!data) {
        return <LoadingDot />;
    }

    return (
        <section className="pt-16 px-4 md:px-12">
    <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl md:text-4xl font-semibold text-violet-800 uppercase mt-4"> {/* Added mt-4 for margin-top */}
            INQUIRIES
        </h1>
    </div>
    
            {/* Directly render TableData without an extra Card wrapper */}
            <TableData
                filter={true}
                label=""
                description="Overview of all inquiries."
                columns={columns}
                data={filteredData} // Pass filtered data here
            />
    
            {selectedInquiry && (
                <EditModal
                    inquiry={selectedInquiry}
                    isOpen={isEditModalOpen}
                    mutate={mutate}
                    onClose={handleCloseEditModal}
                />
            )}
    
            {selectedInquiry && (
                <DeleteModal
                    inquiry={selectedInquiry}
                    isOpen={isDeleteModalOpen}
                    mutate={mutate}
                    onClose={handleCloseDeleteModal}
                />
            )}
        </section>
    );
    
}
