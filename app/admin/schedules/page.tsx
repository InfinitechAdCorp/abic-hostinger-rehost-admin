"use client";

import useSWR, { mutate } from "swr";
import { useEffect, useState } from "react";
import { Button, Card, CardBody } from "@heroui/react";
import toast from "react-hot-toast";
import axios from "axios";
import LoadingDot from "@/components/loading-dot";
import SeeMoreText from "@/components/see-more-text";
import { format } from "date-fns";
import TableData from "@/components/tabledata";

export interface Column<T> {
  key: string;
  label: string;
  renderCell: (row: T) => React.ReactNode;
}

const fetchWithToken = async (url: string) => {
  const token = sessionStorage.getItem("token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  return response.json();
};

const columns: Column<any>[] = [
  {
    key: "user",
    label: "Agent",
    renderCell: (row: any) => (
      <div className="truncate">
        <span>{row.user?.name || "N/A"}</span>
      </div>
    ),
  },
  {
    key: "first_name",
    label: "Info",
    renderCell: (row: any) => (
      <div className="truncate">
        <span>
          <span className="font-semibold">
            {row.first_name} {row.last_name}
          </span>
          <br />
          {row.email} <br />
          {row.phone}
        </span>
      </div>
    ),
  },
  {
    key: "date",
    label: "Date & Time",
    renderCell: (row: any) => {
      if (!row.date || !row.time) return "No date & time";

      const dateTimeString = `${row.date} ${row.time}`;
      const dateObj = new Date(dateTimeString);

      const formattedDate = format(dateObj, "dd-MMM-yyyy");
      const formattedTime = format(dateObj, "hh:mm a");

      return `${formattedDate} ${formattedTime}`;
    },
  },
  {
    key: "type",
    label: "Type",
    renderCell: (row: any) => <span>{row.type}</span>,
  },
  {
    key: "properties",
    label: "Properties",
    renderCell: (row: any) => <span>{row.properties}</span>,
  },
  {
    key: "message",
    label: "Message",
    renderCell: (row: any) => (
      <div>
        <SeeMoreText text={row.message || "No message"} />
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    renderCell: (row: any) => <span>{row.status}</span>,
  },
  {
    key: "id",
    label: "Action",
    renderCell: (row: any) => (
      <div className="flex gap-2">
        {row.status === "Pending" ? (
          <>
            <Button
              color="primary"
              onClick={() => handleAcceptSchedule(row.id)}
              size="sm"
            >
              Accept
            </Button>
            <Button
              color="danger"
              onClick={() => handleDeclineSchedule(row.id)}
              size="sm"
            >
              Decline
            </Button>
          </>
        ) : (
          <span className="text-gray-500 font-semibold">{row.status}</span>
        )}
      </div>
    ),
  },
];

const handleAcceptSchedule = async (id: string) => {
  try {
    const token = sessionStorage.getItem("token");
    await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/schedules/set-status`,
      { id, status: "Accepted" },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    toast.success("Schedule updated successfully!");
    mutate(`${process.env.NEXT_PUBLIC_BASE_URL}/api/schedules`);
  } catch (error) {
    console.error(error);
    toast.error("Failed to update schedule.");
  }
};

const handleDeclineSchedule = async (id: string) => {
  try {
    const token = sessionStorage.getItem("token");
    await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/schedules/set-status`,
      { id, status: "Declined" },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    toast.success("Schedule declined successfully!");
    mutate(`${process.env.NEXT_PUBLIC_BASE_URL}/api/schedules`);
  } catch (error) {
    console.error(error);
    toast.error("Failed to decline schedule.");
  }
};

export default function Home() {
  const { data, error } = useSWR<{
    code: number;
    message: string;
    records: any[];
  }>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/schedules`, fetchWithToken);
  

  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (data?.records) {
      // Sort data by date (newest to oldest)
      const sortedData = [...data.records].sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB.getTime() - dateA.getTime(); // newest to oldest
      });

      setUsers(sortedData);
    }
  }, [data]);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data) {
    return <LoadingDot />;
  }

  return (
    <section className="pt-16 px-4 md:px-12">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-violet-800 uppercase mt-4">
          Schedule
        </h1>
      </div>

      <div className="py-6">
        <TableData
          filter={true}
          label=""
          description="Overview of all Schedules."
          columns={columns}
          data={users}
        />
      </div>
    </section>
  );
}
