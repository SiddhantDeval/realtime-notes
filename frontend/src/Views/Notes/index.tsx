'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Api } from "@/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";

interface NoteItem {
  id: string;
  title: string;
  updatedAt: string;
  content: string;
  // Add other fields as per your API and NoteCard props
}

export default function Notes() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const res = await Api.client.getNotes();
      // Handle different potential response shapes
      const data = res.data || res; // Axios usually returns response object but our wrapper returns res.data
      
      const list = Array.isArray(data) ? data : (data.notes || data.data || []);
      
      if (Array.isArray(list)) {
        setNotes(list);
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error("Failed to fetch notes", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    try {
      const newNote = await Api.client.createNote({ title: "Untitled Note", content: "" });
      // Helper to check for id in different possible response structures
      const note = newNote.data || newNote;
      const noteId = note.id;
      
      if (noteId) {
          router.push(`/note/${noteId}`);
      }
    } catch (error) {
      console.error("Failed to create note", error);
    }
  };

  const filteredNotes = notes.filter(n => (n.title || "").toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="p-8">Loading notes...</div>;

  return (
    <div className="bg-surface-muted-dark dark:bg-surface-primary min-h-[calc(100dvh-121px-65px)] md:min-h-[calc(100dvh-65px-65px)] h-full overflow-y-hidden">
      <div className="relative h-full">
        <section className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="w-full max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div className="flex-1">
                <label className="flex flex-col w-full ">
                  <div className="flex w-full flex-1 items-stretch rounded-xl h-12">
                    <div className="text-[#564f96] dark:text-gray-400 flex border-none bg-white dark:bg-[#1f1d33] items-center justify-center pl-4 rounded-l-xl border-r-0">
                      <span className="material-symbols-outlined">search</span>
                    </div>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-xl text-[#0f0e1b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-white dark:bg-[#1f1d33] h-full placeholder:text-[#564f96] dark:placeholder:text-gray-400 px-4 pl-2 text-base font-normal leading-normal"
                      placeholder="Search discussions..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </label>
              </div>
              <button 
                onClick={handleCreateNote}
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-primary text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors duration-200"
              >
                <span className="material-symbols-outlined">add</span>
                <span className="truncate">Start New Discussion</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredNotes.map((note) => (
                <Link key={note.id} href={`/note/${note.id}`}>
                    <div className="flex flex-col items-stretch justify-start rounded-xl bg-white dark:bg-[#1f1d33] shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer h-full">
                        <div
                            className="w-full bg-center bg-no-repeat aspect-[16/10] bg-cover"
                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAfS7g1f6yGj548MHF3hDtZL-DhI8QeK3dZeQWlo_oI6h6YWnO0JF2PNLFzhn2WR2aPhrdRLu4kTnJ7Ssp_e45L8ZqM9xWWRFc5SP8uz41yM__RCjRg9AR-TBxpP0CxPJVDjI1tMZWZUT_0W6BOvPv0Zp4TkB0Jv8bhAsvY2gsDYZIfQ_Ra2Bwp5xX2LLp8qYOfNfRu96oHTDQ3mY4gcqytJXCvjICFNJx1oLD0ed_Q12vuWPM15H-vRCF8gMxgZn9VS_jobB-s0msH')" }}
                        ></div>
                        <div className="flex w-full grow flex-col items-stretch justify-center gap-1 p-4">
                            <p className="text-[#0f0e1b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                                {note.title || "Untitled"}
                            </p>
                            <div className="flex flex-col gap-2 mt-2">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#564f96] dark:text-gray-400 text-base">person</span>
                                    <p className="text-[#564f96] dark:text-gray-400 text-sm font-normal leading-normal">
                                        Updated {note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : 'Recently'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
