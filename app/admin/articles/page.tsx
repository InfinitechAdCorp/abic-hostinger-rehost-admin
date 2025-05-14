"use client";

import "lightbox2/dist/css/lightbox.min.css";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";

import fetchWithToken from "@/app/utils/fetch-with-token";
import type { Article } from "@/app/utils/types";
import TableData from "@/components/tabledata";
import LoadingDot from "@/components/loading-dot";
import AddModal from "./add-article-modal";
import EditModal from "./edit-article-modal";
import DeleteModal from "./delete-article-modal";

import {
  BreadcrumbItem,
  Breadcrumbs,
  Card,
  CardBody,
  Link,
} from "@heroui/react";
import SeeMoreText from "@/components/see-more-text";

export interface Column<T> {
  key: string;
  label: string;
  renderCell: (row: T) => React.ReactNode;
}

export default function Property() {
  const { data, error, mutate } = useSWR<{
    code: number;
    message: string;
    records: Article[];
  }>("https://abicmanpowerservicecorp.com/api/articles", fetchWithToken);

  const [articles, setArticles] = useState<Article[]>([]);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // State to manage which article's content is visible
  const [visibleContent, setVisibleContent] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window !== "undefined") {
      require("lightbox2");
    }
  }, []);

  useEffect(() => {
    if (data && data.records) {
      const sortedArticles = [...data.records].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime(); // newest to oldest
      });
      setArticles(sortedArticles);
    }
  }, [data]);
  

  const handleAction = (article: Article) => {
    setSelectedArticle(article);
    setEditModalOpen(true);
  };

  const handleDelete = (article: Article) => {
    setSelectedArticle(article);
    setDeleteModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedArticle(null);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedArticle(null);
  };

  const toggleContentVisibility = (id: string) => {
    setVisibleContent((prev) => {
      const newVisibleContent = new Set(prev);
      if (newVisibleContent.has(id)) {
        newVisibleContent.delete(id);
      } else {
        newVisibleContent.add(id);
      }
      return newVisibleContent;
    });
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data) {
    return <LoadingDot />;
  }

  const columns: Column<Article>[] = [
    { key: "title", label: "Title", renderCell: (row) => row.title },
    {
      key: "date",
      label: "Date",
      renderCell: (row) => {
        const formattedDate = row.date
          ? format(new Date(row.date), "dd-MMM-yyyy")
          : "N/A";
        return <span className="inline-block min-w-[120px]">{formattedDate}</span>;
      },
    },
    {
      key: "content",
      label: "Content",
      renderCell: (row) => (
        <div className="w-[300px] lg:w-[400px]">
          <SeeMoreText text={row.content || "No message"} />
        </div>
      ),
    },
    { key: "type", label: "Type", renderCell: (row) => row.type },
    {
      key: "image",
      label: "Preview",
      renderCell: (row) =>
        row.image ? (
          row.image.includes("mp4") ? (
            <video
              src={`https://abicmanpowerservicecorp.com/articles/${row.image}`}
              className="h-24 w-24 object-fit"
              controls
              poster="/image/play-button.png"
            />
          ) : (
            <a
              data-lightbox="gallery"
              data-title={row.title}
              href={`https://abicmanpowerservicecorp.com/articles/${row.image}`}
            >
              <img
                alt={row.title}
                className="h-24 w-24 object-cover"
                src={`https://abicmanpowerservicecorp.com/articles/${row.image}`}
              />
            </a>
          )
        ) : (
          <p>No media available</p>
        ),
    },
    {
      key: "actions",
      label: "Actions",
      renderCell: (row) => (
        <div className="flex space-x-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            onClick={() => handleAction(row)}
          >
            Edit
          </button>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            onClick={() => handleDelete(row)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];
  

  return (
    <section className="pt-16 px-4 md:px-12 mt-4">
      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-bold text-violet-800 uppercase text-center ">
            Articles
          </h1>
        </div>
        <AddModal mutate={mutate} className="mt-10 ml-auto mr-4 py-2 px-6" />
      </div>

      <div className="py-6">
        {/* Remove the outer Card component if TableData already provides structure */}
        <TableData
          filter={true}
          label=""
          description="Overview of all Articles."
          columns={columns}
          data={articles}
        />
      </div>

      {selectedArticle && (
        <EditModal
          article={selectedArticle}
          isOpen={isEditModalOpen}
          mutate={mutate}
          onClose={handleCloseEditModal}
        />
      )}
      {selectedArticle && (
        <DeleteModal
          article={selectedArticle}
          isOpen={isDeleteModalOpen}
          mutate={mutate}
          onClose={handleCloseDeleteModal}
        />
      )}
    </section>
  );
}
