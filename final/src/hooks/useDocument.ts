import { useEffect, useMemo,useState } from "react";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";

import { useDebounce } from "use-debounce";

import { pusherClient } from "@/lib/pusher/client";
import type { Document, User } from "@/lib/types/db";

type PusherPayload = {
  senderId: User["id"];
  document: Document;
};

export const useDocument = () => {
  const { docId } = useParams();
  const documentId = Array.isArray(docId) ? docId[0] : docId;

  const [document, setDocument] = useState<Document | null>(null);
  const [dbDocument, setDbDocument] = useState<Document | null>(null);
  // [NOTE] 2023.11.18 - Extracting the debounceMilliseconds to a constant helps ensure the two useDebounce hooks are using the same value.
  const debounceMilliseconds = 300;
  const [debouncedDocument] = useDebounce(document, debounceMilliseconds);
  const [debouncedDbDocument] = useDebounce(dbDocument, debounceMilliseconds);
  const router = useRouter();

  const { data: session } = useSession();
  const userId = session?.user?.id;

  // [FIX] 2023.11.18 - This memo should compare the debounced values to avoid premature updates to the DB.
  const isSynced = useMemo(() => {
    if (debouncedDocument === null || debouncedDbDocument === null) return true;
    return (
        debouncedDocument.title === debouncedDbDocument.title &&
        debouncedDocument.content === debouncedDbDocument.content
    );
  }, [debouncedDocument, debouncedDbDocument]);

  // When the debounced document changes, update the document
  // [FIX] 2023.11.18 - Listen to debouncedDbDocument instead of dbDocument.
  // Explanation: This useEffect should trigger on the change of the debouncedDocument and debouncedDbDocument.
  //              Originally, it was triggered by debouncedDocument but dbDocument.
  //              Therefore, when the received pusher event updates the document and the dbDocument.
  //              This useEffect will trigger twice: one when dbDocument is updated and another when debouncedDocument is updated.
  //              However, the two updates PUTs sends conflicting pusher events to the other clients, causing the document to twitch indefinitely.
  useEffect(() => {
    // [NOTE] 2023.11.18 - If either of the debounced value is null, then `isSynced` must be true. 
    //                     Therefore, we don't need to explicitly check for their null values.
    if (isSynced) return;

    const updateDocument = async () => {
      if (!debouncedDocument) return;
      // [NOTE] 2023.11.18 - This PUT request will trigger a pusher event that will update the document to the other clients.
      const res = await fetch(`/api/documents/${documentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: debouncedDocument.title,
          content: debouncedDocument.content,
        }),
      });
      if (!res.ok) {
        return;
      }
      const data: Document = await res.json();
      // Update the navbar if the title changed
      if (debouncedDbDocument?.title !== data.title) {
        router.refresh();
      }
      setDbDocument(data);
    };
    updateDocument();
  }, [debouncedDocument, documentId, router, debouncedDbDocument, isSynced]);

  // Subscribe to pusher events
  useEffect(() => {
    if (!documentId) return;
    // Private channels are in the format: private-...
    const channelName = `private-${documentId}`;

    try {
      const channel = pusherClient.subscribe(channelName);
      channel.bind("doc:update", ({ senderId, document: received_document }: PusherPayload) => {
        if (senderId === userId) {
          return;
        }
        // [NOTE] 2023.11.18 - This is the pusher event that updates the dbDocument.
        setDocument(received_document);
        setDbDocument(received_document);
        router.refresh();
      });
    } catch (error) {
      console.error(error);
      router.push("/docs");
    }

    // Unsubscribe from pusher events when the component unmounts
    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [documentId, router, userId]);

  useEffect(() => {
    if (!documentId) return;
    const fetchDocument = async () => {
      const res = await fetch(`/api/documents/${documentId}`);
      if (!res.ok) {
        setDocument(null);
        router.push("/docs");
        return;
      }
      const data = await res.json();
      setDocument(data);
      setDbDocument(data);
    };
    fetchDocument();
  }, [documentId, router]);

  const title = document?.title || "";
  const setTitle = (newTitle: string) => {
    if (document === null) return;
    setDocument({
      ...document,
      title: newTitle,
    });
  };

  const content = document?.content || "";
  const setContent = (newContent: string) => {
    if (document === null) return;
    setDocument({
      ...document,
      content: newContent,
    });
  };

  return {
    documentId,
    document,
    title,
    setTitle,
    content,
    setContent,
  };
};
