import { useEffect, useRef, useState } from "react";

// --- helpers
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

// Track selection for cursor broadcasting
function getCaret(textarea: HTMLTextAreaElement) {
  return { start: textarea.selectionStart, end: textarea.selectionEnd };
}

type Op =
  | { op: "insert"; pos: number; text: string }
  | { op: "delete"; pos: number; len: number }
  | { op: "replace"; pos: number; len: number; text: string };

export default function Note({
  noteId,
  initialContent,
  initialVersion,
  socket,
}: {
  noteId: string;
  initialContent: string;
  initialVersion: number;
  socket: any; // your Socket.IO client
}) {
  const [content, setContent] = useState(initialContent);
  const clientVersionRef = useRef(initialVersion);
  const prevContentRef = useRef(initialContent);

  // const [serverContent, setServerContent] = useState(initialContent);
  // const serverContentRef = useRef(initialContent);
  // const serverApply = (packet: { noteId: string; opId: string; clientVersion: number; ops: Op[] }) => {
  //   new Promise<void>((resolve, reject) => {
  //     setTimeout(() => {
  //       setServerContent((old) => applyOps(old, packet.ops));
  //       serverContentRef.current = applyOps(serverContentRef.current, packet.ops);
  //       resolve();
  //     }, 200);
  //   });
  // };

  // Outbound queue + batch timer
  const outboundRef = useRef<{ ops: Op[] } | null>(null);
  const batchTimerRef = useRef<number | null>(null);

  // Handle remote edits (from server broadcast)
  useEffect(() => {
    function onRemoteEdit(payload: { noteId: string; serverVersion: number; ops: Op[]; opId: string }) {
      if (payload.noteId !== noteId) return;
      // Apply ops to local state deterministically
      setContent((old) => applyOps(old, payload.ops));
      prevContentRef.current = applyOps(prevContentRef.current, payload.ops);
      clientVersionRef.current = payload.serverVersion;
    }
    function onOpAck(payload: { opId: string; serverVersion: number }) {
      clientVersionRef.current = payload.serverVersion;
    }
    function onOpRejected(payload: { latestContent: string; latestVersion: number }) {
      // Hard resync + (optional) rebase pending ops
      setContent(payload.latestContent);
      prevContentRef.current = payload.latestContent;
      clientVersionRef.current = payload.latestVersion;
      outboundRef.current = null; // drop local batch for simplicity; or rebase then resend
    }
    // socket.on('remote_edit', onRemoteEdit);
    // socket.on('op_ack', onOpAck);
    // socket.on('op_rejected', onOpRejected);
    return () => {
      //   socket.off('remote_edit', onRemoteEdit);
      //   socket.off('op_ack', onOpAck);
      //   socket.off('op_rejected', onOpRejected);
    };
  }, [noteId, socket]);

  // Main onChange: compute ops vs previous, batch & send
  function onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = e.target.value;

    // Compose IME-friendly: ignore mid-composition; optional
    // if (e.nativeEvent.isComposing) { setContent(next); return; }

    const ops = diffToOps(prevContentRef.current, next);
    setContent(next);
    if (ops.length === 0) return;

    // Accumulate in current batch
    if (!outboundRef.current) outboundRef.current = { ops: [] };
    outboundRef.current.ops.push(...ops);
    prevContentRef.current = next; // optimistic

    // Debounced send
    if (batchTimerRef.current) window.clearTimeout(batchTimerRef.current);
    batchTimerRef.current = window.setTimeout(() => {
      if (!outboundRef.current || outboundRef.current.ops.length === 0) return;
      const packet = {
        noteId,
        opId: uuid(),
        clientVersion: clientVersionRef.current,
        ops: outboundRef.current.ops,
      };
      console.log("ops packet", packet);
      // serverApply(packet);
      //   socket.emit('edit', packet);
      outboundRef.current = null;
    }, 200); // 150–300ms is a good window
  }

  // Broadcast cursor (throttle)
  function onSelect(e: React.SyntheticEvent<HTMLTextAreaElement>) {
    const ta = e.currentTarget;
    const { start } = getCaret(ta);
    console.log("cursor_move", { noteId, position: start });
    // socket.emit('cursor_move', { noteId, position: start });
  }

  return (
    <div className="space-y-4">
      <textarea
        className="border"
        value={content}
        onChange={onChange}
        onSelect={onSelect}
        onKeyUp={onSelect}
        style={{ width: "100%", height: 400 }}
      />
      {/* <textarea className="border" value={serverContent} style={{ width: "100%", height: 400 }} /> */}
    </div>
  );
}

// Pure function to apply ops to a string (must match server logic)
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
