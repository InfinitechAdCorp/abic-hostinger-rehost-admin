'use client';
import React from 'react';
import "lightbox2/dist/css/lightbox.min.css";
import useSWR from 'swr';
import { useEffect, useState } from 'react';
import { Certificate } from '@/app/utils/types';
import AddCertificateModal from './add-certificate-modal';
import DeleteCertificateModal from './delete-certificate-modal';
import EditCertificateModal from './edit-certificate-modal';
import LoadingDot from '@/components/loading-dot';
import { Card, CardBody } from '@heroui/react';
import fetchWithToken from "@/app/utils/fetch-with-token";
import { format } from "date-fns";
import TableData from "@/components/tabledata";

// Define Column type explicitly if necessary
interface Column<T = any> {
    key: string;
    label: string;
    renderCell?: (row: T) => React.ReactNode;
}

// Define columns
const columns: Column<any>[] = [
    { key: 'name', label: 'Name' },
    {
        key: 'date',
        label: 'Date',
        renderCell: (row: any) => {
            const formattedDate = row.date
                ? format(new Date(row.date), 'dd-MMM-yyyy')
                : 'N/A';
            return <span>{formattedDate}</span>;
        },
    },
    {
        key: 'image',
        label: 'Image',
        renderCell: (row: any) => (
            <a
                data-lightbox="gallery"
                data-title={row.name}
                href={`https://abicmanpowerservicecorp.com/certificates/${row.image}`}
            >
                <img
                    alt={row.name}
                    className="h-24 w-24 object-cover"
                    src={`https://abicmanpowerservicecorp.com/certificates/${row.image}`}
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
                    onClick={() => handleEdit(row)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    Edit
                </button>

                {/* Delete Button */}
                <button
                    onClick={() => handleDelete(row)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                    Delete
                </button>
            </div>
        ),
    },
];

// Sample handler functions
const handleEdit = (row: any) => {
    console.log("Edit clicked for:", row);
    // Add your edit logic here (e.g., open a modal)
};

const handleDelete = (row: any) => {
    console.log("Delete clicked for:", row);
    // Add your delete logic here (e.g., show a confirmation modal)
};

export default function CertificatesPage() {
    const { data, error, mutate } = useSWR<{
        code: number;
        message: string;
        records: Certificate[];
    }>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/certificates`, fetchWithToken);

    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const lightbox2 = require("lightbox2");
            lightbox2.option({
                resizeDuration: 200,
                wrapAround: true,
            });
        }
    }, []);
    
    useEffect(() => {
        if (data?.records) {
            const sortedCertificates = data.records.sort((a, b) => {
                // Convert date strings to Date objects and compare them
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB.getTime() - dateA.getTime(); // Sorting in descending order (newest first)
            });
            setCertificates(sortedCertificates);
        }
    }, [data]);

    const handleAction = (certificate: Certificate) => {
        setSelectedCertificate(certificate);
        setEditModalOpen(true);
    };

    const handleDelete = (certificate: Certificate) => {
        setSelectedCertificate(certificate);
        setDeleteModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setEditModalOpen(false);
        setSelectedCertificate(null);
    };

    const handleCloseDeleteModal = () => {
        setDeleteModalOpen(false);
        setSelectedCertificate(null);
    };

    if (error) {
        return <div className="text-red-500">Error: {error.message}</div>;
    }

    if (!data) {
        return <LoadingDot />;
    }

    return (
        <section className="pt-16 px-4 md:px-12 mt-4">
            <div className="flex justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-violet-800 uppercase text-center">
                        Certificates
                    </h1>
                </div>
                <AddCertificateModal mutate={mutate} className="mt-10 ml-auto mr-4 py-2 px-6" />
            </div>
            <div className="py-6">
                <Card>
                    <TableData
                        filter={true}
                        label=""
                        description="Overview of all Certificates."
                        columns={columns}
                        data={certificates}
                    />
                </Card>
            </div>

            {selectedCertificate && (
                <EditCertificateModal
                    certificate={selectedCertificate}
                    isOpen={isEditModalOpen}
                    mutate={mutate}
                    onClose={handleCloseEditModal}
                />
            )}

            {selectedCertificate && (
                <DeleteCertificateModal
                    certificate={selectedCertificate}
                    isOpen={isDeleteModalOpen}
                    mutate={mutate}
                    onClose={handleCloseDeleteModal}
                />
            )}
        </section>
    );
}
