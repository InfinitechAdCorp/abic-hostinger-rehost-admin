"use client";

import useSWR from "swr";
import { useEffect, useState } from "react";
import "lightbox2/dist/css/lightbox.min.css";
import Link from "next/link";
import TableData from "@/components/tabledata";
import { Career } from "@/app/utils/types";
import AddCareerModal from "./add-career-modal";
import EditCareerModal from "./edit-career-modal";
import DeleteModal from "./delete-career-modal";
import LoadingDot from "@/components/loading-dot";
import { Button, Card, CardBody } from "@heroui/react";
import fetchWithToken from "@/app/utils/fetch-with-token";
import toast from "react-hot-toast";
interface Column<T = any> {
  key: string;
  label: string;
  renderCell?: (row: T) => React.ReactNode;
}

type CareerWithActions = Career & {
  onAction: (row: Career) => void;
  onDelete: (row: Career) => void;
};

const columns: Column<CareerWithActions>[] = [
  { key: "position", label: "Position" },
  { key: "slots", label: "Slots" },
  {
    key: "applications_count",
    label: "Applicants",
    renderCell: (row: any) => (
      <Link href={`/admin/careers/${row.id}`}>
        <Button size="sm" color="primary">
          {row.applications_count}
        </Button>
      </Link>
    ),
  },
  {
    key: "image",
    label: "Image",
    renderCell: (row: any) => (
      <a
        data-lightbox="gallery"
        data-title={row.position}
        href={`https://abicmanpowerservicecorp.com/careers/images/${row.image}`}
      >
        <img
          alt={row.position}
          className="h-24 w-24 object-cover"
          src={`https://abicmanpowerservicecorp.com/careers/images/${row.image}`}
        />
      </a>
    ),
  },
  {
    key: "actions",
    label: "Actions",
    renderCell: (row: any) => (
      <div className="flex space-x-2">
        <button
          onClick={() => row.onAction(row)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Edit
        </button>
        <button
          onClick={() => row.onDelete(row)}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    ),
  },
];

export default function CareersPage() {
  const { data, error, mutate } = useSWR<{
    code: number;
    message: string;
    records: Career[];
  }>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/careers`, fetchWithToken);

  const [careers, setCareers] = useState<Career[]>([]);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);

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
      setCareers(data.records);
    }
  }, [data]);

  const handleAction = (career: Career) => {
    setSelectedCareer(career);
    setEditModalOpen(true);
  };

  const handleDelete = (career: Career) => {
    setSelectedCareer(career);
    setDeleteModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedCareer(null);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedCareer(null);
  };

  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <LoadingDot />;

  const rowsWithActions: CareerWithActions[] = careers.map((career) => ({
    ...career,
    onAction: () => handleAction(career),
    onDelete: () => handleDelete(career),
  }));

  return (
    <section className="pt-16 px-4 md:px-12 mt-4">
      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-bold text-violet-800 uppercase text-center ">
            Careers
          </h1>
        </div>
        <AddCareerModal
          mutate={mutate}
          className="mt-10 ml-auto mr-4 py-2 px-6"
        />
      </div>
      <div className="py-6">
        <Card>
          <TableData
            data={rowsWithActions}
            columns={columns}
            label=""
            description="Overview of all Careers"
            filter={true}
          />
        </Card>
      </div>

      {selectedCareer && (
        <EditCareerModal
          career={selectedCareer}
          isOpen={isEditModalOpen}
          mutate={mutate}
          onClose={handleCloseEditModal}
        />
      )}

      {selectedCareer && (
        <DeleteModal
          career={selectedCareer}
          isOpen={isDeleteModalOpen}
          mutate={mutate}
          onClose={handleCloseDeleteModal}
        />
      )}
    </section>
  );
}
