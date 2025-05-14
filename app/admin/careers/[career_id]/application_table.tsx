'use client';

import useSWR from 'swr';
import { useEffect, useState } from 'react';
import TableData from '@/components/tabledata';
import { Application } from '@/app/utils/types';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import fetchWithToken from '@/app/utils/fetch-with-token';

export type Column<T> = {
    key: keyof T | string;
    label: string;
    renderCell?: (row: T) => JSX.Element;
};

interface ApplicationTableProps {
    career_id: string;
}

const columns: Column<Application>[] = [
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'Address' },
    {
        key: 'resume',
        label: 'Resume',
        renderCell: (application) => (
            <>
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => {
                            const fileUrl = `https://abicmanpowerservicecorp.com/careers/applications/${application.resume}`;

                            // Generate filename in the format: first_name_last_name_resume
                            const fileName = `${application.first_name.toLowerCase()}_${application.last_name.toLowerCase()}_resume`;

                            // Extract the file extension from the file URL
                            const fileExtension = fileUrl.split('.').pop()?.toLowerCase(); // Get the file extension

                            // Create the full filename by appending the extension
                            const fullFileName = `${fileName}.${fileExtension}`;

                            // Create an anchor element for download
                            const anchor = document.createElement('a');
                            anchor.href = fileUrl;
                            anchor.download = fullFileName; // Set the download attribute with the dynamically generated filename

                            // For images and PDFs, you need to fetch the file and manually trigger the download
                            // This will prevent the browser from trying to open it
                            fetch(fileUrl)
                                .then((response) => response.blob())  // Get the file as a Blob
                                .then((blob) => {
                                    const url = window.URL.createObjectURL(blob);
                                    anchor.href = url;  // Set the Blob URL as the href
                                    document.body.appendChild(anchor);
                                    anchor.click();
                                    document.body.removeChild(anchor);
                                    window.URL.revokeObjectURL(url);  // Clean up the Blob URL
                                })
                                .catch((err) => {
                                    console.error('Download failed', err);
                                });
                        }}
                        className="text-white bg-blue-500 border border-blue-500 px-2 py-1 rounded"
                    >
                        Download
                    </button>
                </div>
            </>
        ),
    },
];

const ApplicationTable: React.FC<ApplicationTableProps> = ({ career_id }) => {
    const { data, error, mutate } = useSWR<{
        code: number;
        message: string;
        record: {
            id: string;
            position: string;
            slots: number;
            image: string;
            applications: Application[];
        };
    }>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/careers/${career_id}`, fetchWithToken);

    const [applications, setApplications] = useState<Application[]>([]);

    useEffect(() => {
        if (data && data.record && data.record.applications) {
            setApplications(data.record.applications);
        }
    }, [data]);

    return (
        <main className="container mx-auto p-4">
            <div className="flex-col justify-start items-center mb-4">
                <Link color="primary" href="/admin/careers" className="text-primary flex items-center">
                    <ChevronLeft size={20} /> Back
                </Link>
                <h1 className="text-2xl font-bold">Applications Table</h1>
            </div>
            <TableData
                data={applications}
                columns={columns}
                label="" // Title of the table
                description="Overview of all Careers" // Optional description
                filter={true}
            />
        </main>
    );
};

export default ApplicationTable;
