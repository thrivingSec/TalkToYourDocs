"use client";
import React, { ChangeEvent, useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/store";
import toast from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { env } from "@/shared/env";

interface INGESTRES {
  success: boolean;
  message: string;
  data?: {
    chunkCount: number;
    namesapce: string;
    source: string;
    documentID: string;
  };
}

const UploadDoc = () => {
  const [namespace, setNamespace] = useState<string>("");
  const [file, setFile] = useState<File | null>();
  const [ingesting, setIngesting] = useState(false);
  const { addDocument, namespaces, fetchNamespaces } = useStore();

  useEffect(() => {
    if (namespaces === null) {
      fetchNamespaces();
    }
  }, [fetchNamespaces]);

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  }
  const API_BASE = process.env.NEXT_PUBLIC_NODE_ENV === 'development' ? `http://localhost:3000/api` : ''
  async function handleFileUpload(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file || !namespace) return;
    const formData = new FormData();
    formData.append("namespace", namespace);
    formData.append("file", file);
    setIngesting(true);
    try {
      const response = await axios.post<INGESTRES>(
        `${API_BASE}/rag/ingest`,
        formData,
        { withCredentials: true },
      );
      const rawData = response.data?.data;
      if (!rawData) {
        toast.error("No data received from ingestion")
        return;
      }
      
      toast.success("Document ingested - KB Created");
      addDocument({
        documentID: rawData.documentID,
        source: rawData.source,
        namespace: rawData.namesapce,
      });
    } catch (error) {
      // Set error in result
      console.log("Error in documnet reponse :: ", error);
      toast.success("Error in document ingestion, please try again")
    } finally {
      setIngesting(false);
    }
  }
  return (
    <form onSubmit={handleFileUpload} className="flex flex-col gap-5">

      <DropdownMenu >
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="cursor-pointer" >{namespace ? namespace : "Namespace"}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Available Namespaces</DropdownMenuLabel>
            {namespaces && namespaces.map((ns, index) => (
              <DropdownMenuItem key={index}  onClick={e => setNamespace(ns)} className="cursor-pointer">{ns}</DropdownMenuItem>
            ))}
            {!namespaces && null}
          </DropdownMenuGroup>
          
        </DropdownMenuContent>
      </DropdownMenu>

      <Input type="file" onChange={handleFile} className="cursor-pointer"/>

      <Button type="submit" disabled={ingesting} className="w-full cursor-pointer">
        {ingesting ? "Uploading..." : "Ingest Document"}
      </Button>
    </form>
  );
};

export default UploadDoc;
