'use client';

import useSWR from 'swr';
import { useEffect, useState } from 'react';
import React from 'react';

import TableData from '@/components/tabledata';
import { Testimonial } from '@/app/utils/types'; // Ensure Testimonial type is imported correctly
import AddTestimonialModal from './add-testimonial-modal';
import DeleteTestimonial from './delete-testimonial-modal';
import EditTestimonialModal from './edit-testimonial-modal';
import LoadingDot from '@/components/loading-dot';
import { Card } from '@heroui/react';  // Removed unused CardBody import
import SeeMoreText from '@/components/see-more-text';

type TestimonialWithActions = Testimonial & {
  onAction: (row: Testimonial) => void;
  onDelete: (row: Testimonial) => void;
};

export type Column<T> = {
  key: keyof T | string;
  label: string;
  renderCell?: (row: T) => JSX.Element;
};

const fetchWithToken = async (url: string) => {
  const token = sessionStorage.getItem('token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }

  return response.json();
};

const columns: Column<TestimonialWithActions>[] = [
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'message', label: 'Message', renderCell: (row: Testimonial) => (
    <div className="w-[500px] lg:w-[800px]">
      <SeeMoreText text={row.message || "No message"} />
    </div>
  )},
  {
    key: 'actions',
    label: 'Actions',
    renderCell: (row: TestimonialWithActions) => (
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

export default function TestimonialsPage() {
  const { data, error, mutate } = useSWR<{
    code: number;
    message: string;
    records: Testimonial[];
  }>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/testimonials`, fetchWithToken);

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);

  useEffect(() => {
    if (data && data.records) {
      setTestimonials(data.records);
    }
  }, [data]);

  const handleAction = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setEditModalOpen(true);
  };

  const handleDelete = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setDeleteModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedTestimonial(null);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedTestimonial(null);
  };

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  if (!data) {
    return <LoadingDot />;
  }

  // Add onAction and onDelete props to each testimonial row
  const rowsWithActions = testimonials.map(testimonial => ({
    ...testimonial,
    onAction: handleAction,
    onDelete: handleDelete,
  }));

  return (
    <section className="pt-16 px-4 md:px-12 mt-4">
    <div className="flex justify-between">
      <div>
        <h1 className="text-3xl font-bold text-violet-800 uppercase text-center ">
        Testimonials
        </h1>
      </div>
      <AddTestimonialModal mutate={mutate} className="mt-10 ml-auto mr-4 py-2 px-6" />
    </div>
    
      <div className="py-6">
        <Card>
          <TableData
            filter={true}
            data={rowsWithActions}
            columns={columns}
            label=""
            description="Overview of all Testimonials"
          />
        </Card>
      </div>

      {selectedTestimonial && (
        <EditTestimonialModal
          testimonial={selectedTestimonial}
          isOpen={isEditModalOpen}
          mutate={mutate}
          onClose={handleCloseEditModal}
        />
      )}
      {selectedTestimonial && (
        <DeleteTestimonial
          testimonial={selectedTestimonial}
          isOpen={isDeleteModalOpen}
          mutate={mutate}
          onClose={handleCloseDeleteModal}
        />
      )}
    </section>
  );
}
