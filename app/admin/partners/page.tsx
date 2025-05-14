'use client';

import useSWR from 'swr';
import { useEffect, useState } from 'react';
import "lightbox2/dist/css/lightbox.min.css";
import TableData from '@/components/tabledata';
import { Partner } from '@/app/utils/types';
import AddPartnerModal from './add-partner-modal';
import EditPartnerModal from './edit-partner-modal';
import DeletePartnerModal from './delete-partner-modal';
import LoadingDot from '@/components/loading-dot';
import { Card, CardBody } from '@heroui/react';
import fetchWithToken from '@/app/utils/fetch-with-token';
import toast from 'react-hot-toast'; // Import toast for notifications
export type Column<T> = {
    key: keyof T | string;
    label: string;
    renderCell?: (row: T) => JSX.Element;
};
const columns: Column<Partner>[] = [
    { key: 'name', label: 'Name' },
    {
        key: 'image',
        label: 'Logo',
        renderCell: (row: any) => (
            <a
                data-lightbox="gallery"
                data-title={row.name}
                href={`https://abicmanpowerservicecorp.com/partners/${row.image}`}
            >
                <img
                    alt={row.name}
                    className="h-24 w-24 object-cover"
                    src={`https://abicmanpowerservicecorp.com/partners/${row.image}`}
                />
            </a>
        ),
    },
    {
        key: 'actions',
        label: 'Actions',
        renderCell: (row: any) => (
            <div className="flex space-x-2">
                {/* Edit Button */}
                <button
                    key={`edit-${row.id}`}
                    onClick={() => row.onAction(row)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    Edit
                </button>

                {/* Delete Button */}
                <button
                    key={`delete-${row.id}`}
                    onClick={() => row.onDelete(row)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                    Delete
                </button>
            </div>
        ),
    },
];

export default function PartnersPage() {
    const { data, error, mutate } = useSWR<{ code: number; message: string; records: Partner[] }>(
        'https://abicmanpowerservicecorp.com/api/partners',
        fetchWithToken
    );

    const [partners, setPartners] = useState<Partner[]>([]);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            require('lightbox2');
        }
    }, []);

    useEffect(() => {
        if (data && data.records) {
            setPartners(data.records);
        }
    }, [data]);

    const handleAction = (partner: Partner) => {
        setSelectedPartner(partner);
        setEditModalOpen(true);
    };

    const handleDelete = (partner: Partner) => {
        setSelectedPartner(partner);
        setDeleteModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setEditModalOpen(false);
        setSelectedPartner(null);
        
    };

    const handleCloseDeleteModal = () => {
        setDeleteModalOpen(false);
        setSelectedPartner(null);
  
    };

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    if (!data) {
        return <LoadingDot />;
    }

    // Modify the partners array to include the actions
    const rowsWithActions = partners.map(partner => ({
        ...partner,
        onAction: handleAction,
        onDelete: handleDelete,
    }));

    return (
        <section className="pt-16 px-4 md:px-12 mt-4">
      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-bold text-violet-800 uppercase text-center ">
          Partners
          </h1>
        </div>
        <AddPartnerModal mutate={mutate} className="mt-10 ml-auto mr-4 py-2 px-6" />
      </div>
        
            <div className='py-6'>
                <Card>
                    {/* <CardBody> */}
                    <TableData
            data={rowsWithActions}      // Data to populate the table
            columns={columns}           // Table columns definition
            label=""         // Title of the table
            description="Overview of all Partners" // Optional description
            // statusOptions={[            // Array of status options for the filter dropdown
            //     { key: "for sale", label: "For Sale" },
            //     { key: "for rent", label: "For Rent" },
            //     { key: "all", label: "All" },
            //     // Add other status options as needed
            // ]}
            filter={true}               // Determines if the filter should be shown (set to false to hide)
        />
                    {/* </CardBody> */}
                </Card>
            </div>

            {selectedPartner && (
                <EditPartnerModal
                    partner={selectedPartner}
                    isOpen={isEditModalOpen}
                    mutate={mutate}
                    onClose={handleCloseEditModal}
                />
            )}

            {selectedPartner && (
                <DeletePartnerModal
                    partner={selectedPartner}
                    isOpen={isDeleteModalOpen}
                    mutate={mutate}
                    onClose={handleCloseDeleteModal}
                />
            )}
        </section>
    );
}
