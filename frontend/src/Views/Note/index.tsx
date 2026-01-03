"use client";

import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Api } from "@/api";
import { useParams } from "next/navigation";

// --- Helpers ---
function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : String(Math.random());
}

function diffToOps(prev: string, next: string): Op[] {
  if (prev === next) return [];
  // 1) longest common prefix
  let start = 0;
  const minLen = Math.min(prev.length, next.length);
  while (start < minLen && prev[start] === next[start]) start++;

  // 2) longest common suffix (avoid crossing start)
  let endPrev = prev.length - 1;
  let endNext = next.length - 1;
  while (endPrev >= start && endNext >= start && prev[endPrev] === next[endNext]) {
    endPrev--;
    endNext--;
  }

  const deleted = prev.slice(start, endPrev + 1);
  const inserted = next.slice(start, endNext + 1);

  if (deleted.length && inserted.length) {
    // replace
    return [{ op: "replace", pos: start, len: deleted.length, text: inserted }];
  } else if (deleted.length) {
    // delete
    return [{ op: "delete", pos: start, len: deleted.length }];
  } else {
    // insert
    return [{ op: "insert", pos: start, text: inserted }];
  }
}

function getCaret(textarea: HTMLTextAreaElement) {
  return { start: textarea.selectionStart, end: textarea.selectionEnd };
}

type Op =
  | { op: "insert"; pos: number; text: string }
  | { op: "delete"; pos: number; len: number }
  | { op: "replace"; pos: number; len: number; text: string };

// Pure function to apply ops to a string
function applyOps(s: string, ops: Op[]) {
  let out = s;
  for (const op of ops) {
    if (op.op === "insert") {
      out = out.slice(0, op.pos) + op.text + out.slice(op.pos);
    } else if (op.op === "delete") {
      out = out.slice(0, op.pos) + out.slice(op.pos + op.len);
    } else if (op.op === "replace") {
      out = out.slice(0, op.pos) + op.text + out.slice(op.pos + op.len);
    }
  }
  return out;
}

export default function Note({ noteId }: { noteId: string }) {
  const socket = useSocket();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("Untitled Note");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Connecting...");

  const clientVersionRef = useRef(0);
  const prevContentRef = useRef("");
  const outboundRef = useRef<{ ops: Op[] } | null>(null);
  const batchTimerRef = useRef<number | null>(null);

  // Initial fetch
  useEffect(() => {
    async function load() {
        try {
            const res = await Api.client.getNote(noteId);
            // Handling robust response: { data: note } or just note
            const note = res.data || res;
            if (note) {
                setContent(note.latestContent || "");
                prevContentRef.current = note.latestContent || "";
                setTitle(note.title || "Untitled Note");
                clientVersionRef.current = note.version || 0;
            }
        } catch (e: any) {
            console.error("Failed to load note", e);
            setStatus("Error loading note: " + (e.error || e.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    }
    load();
  }, [noteId]);

  // Socket Logic
  useEffect(() => {
    if (!socket || loading) return;

    // Join room
    socket.emit('join_note', { noteId });

    function onJoinedNote(payload: { latestContent: string, version: number }) {
        setStatus("Connected");
        setContent(payload.latestContent);
        prevContentRef.current = payload.latestContent;
        clientVersionRef.current = payload.version;
    }

    function onRemoteEdit(payload: { noteId: string; serverVersion: number; ops: Op[]; opId: string }) {
      if (payload.noteId !== noteId) return;
      
      setContent((old) => applyOps(old, payload.ops));
      prevContentRef.current = applyOps(prevContentRef.current, payload.ops);
      clientVersionRef.current = payload.serverVersion;
    }

    function onOpRejected(payload: { latestContent: string; latestVersion: number }) {
        // Resync
        setContent(payload.latestContent);
        prevContentRef.current = payload.latestContent;
        clientVersionRef.current = payload.latestVersion;
        outboundRef.current = null;
    }

    function onError(payload: { message: string }) {
        console.error("Socket error", payload.message);
        setStatus(`Error: ${payload.message}`);
    }

    socket.on('joined_note', onJoinedNote);
    socket.on('remote_edit', onRemoteEdit);
    socket.on('op_rejected', onOpRejected);
    socket.on('error', onError);

    return () => {
        socket.off('joined_note', onJoinedNote);
        socket.off('remote_edit', onRemoteEdit);
        socket.off('op_rejected', onOpRejected);
        socket.off('error', onError);
    };
  }, [socket, noteId, loading]);


  // Text Change Handler
  function onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = e.target.value;
    const ops = diffToOps(prevContentRef.current, next);
    setContent(next);
    if (ops.length === 0) return;

    if (!outboundRef.current) outboundRef.current = { ops: [] };
    outboundRef.current.ops.push(...ops);
    prevContentRef.current = next;

    if (batchTimerRef.current) window.clearTimeout(batchTimerRef.current);
    batchTimerRef.current = window.setTimeout(() => {
      if (!outboundRef.current || outboundRef.current.ops.length === 0 || !socket) return;
      
      const packet = {
        noteId,
        opId: uuid(),
        clientVersion: clientVersionRef.current,
        ops: outboundRef.current.ops,
      };
      
      socket.emit('edit_note', packet);
      outboundRef.current = null;
    }, 200);
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
      setTitle(e.target.value);
  }

  function saveTitle() {
      Api.client.updateNote(noteId, { title }).catch(console.error);
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="relative flex min-h-[calc(100dvh-121px-65px)] md:min-h-[calc(100dvh-65px-65px)] w-full flex-col bg-background-light dark:bg-background-dark font-display text-[#1F2937] dark:text-gray-200">
      <main className="flex flex-1 flex-col lg:flex-row h-full">
        <div className="flex flex-1 flex-col p-4 md:p-8 h-full">
          <div className="mb-6">
            <input
              className="form-input w-full resize-none overflow-hidden border-none bg-transparent p-0 text-3xl font-bold text-[#1F2937] dark:text-white placeholder:text-gray-400 focus:outline-0 focus:ring-0 md:text-4xl"
              value={title}
              onChange={handleTitleChange}
              onBlur={saveTitle}
            />
          </div>
          <div className="relative flex flex-1 flex-col lg:h-auto h-full">
            <div
              className="relative flex flex-1 flex-col rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 h-full"
            >
              <textarea
                className="form-input min-h-[500px] flex-1 resize-none rounded-lg border-none bg-transparent p-4 md:p-6 text-base leading-relaxed text-[#1F2937] dark:text-gray-200 placeholder:text-[#6B7281] focus:outline-0 focus:ring-0"
                placeholder="Start writing your note here..."
                value={content}
                onChange={onChange}
              ></textarea>
            </div>
          </div>
        </div>
        
        {/* Sidebar Activity Stream Placeholder - as per HTML */}
        <aside className="hidden w-full max-w-sm shrink-0 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark p-6 lg:flex lg:flex-col">
            <div className="flex flex-col gap-8">
                <div>
                  <h3 className="text-[#1F2937] dark:text-white text-lg font-bold mb-3">Activity Stream</h3>
                   <ul className="space-y-4">
                        <li className="flex items-center gap-3">
                            <div>
                                <p className="text-sm font-medium text-[#1F2937] dark:text-gray-200">System</p>
                                <p className="text-xs text-[#6B7281] dark:text-gray-400">Collaborators will appear here</p>
                            </div>
                        </li>
                   </ul>
                </div>
            </div>
        </aside>
      </main>
    </div>
  );
}
